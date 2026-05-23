import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';
import { generateOrderNumber } from '../utils/crypto.js';
import { paymentService } from '../services/payment.js';

const router = Router();

// ── Schemas ───────────────────────────────

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().nullable().optional(),
    quantity: z.number().int().min(1),
  })).min(1, 'Sepetinizde en az bir ürün olmalı'),
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
  }),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

const TAX_RATE = 0.10; // KDV 10%

// ── Routes ────────────────────────────────

// POST / — create checkout / order
router.post('/', optionalAuth, validate(checkoutSchema), async (req, res) => {
  try {
    const { items, shipping, couponCode, idempotencyKey } = req.body;
    const userId = req.user?.userId || null;

    // ── 1. Idempotency check ──
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { payment: true },
      });

      if (existingOrder) {
        logger.info(`Idempotent checkout hit: ${existingOrder.orderNumber}`);
        return res.json({
          success: true,
          data: {
            orderId: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            iframeToken: existingOrder.payment?.providerToken || null,
            total: existingOrder.total,
          },
        });
      }
    }

    // ── 2. Recalculate prices from DB & validate stock ──
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const resolvedItems = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: `Ürün bulunamadı veya satışta değil: ${item.productId}`,
        });
      }

      let unitPrice = Number(product.price);
      let unitDiscount = Number(product.discount);
      let availableStock = product.stock;

      // If variant specified, use variant price & stock
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant || !variant.isActive) {
          return res.status(400).json({
            success: false,
            error: `Ürün varyantı bulunamadı: ${item.variantId}`,
          });
        }
        unitPrice = Number(variant.price);
        availableStock = variant.stock;
      }

      // ── 3. Validate stock ──
      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Yetersiz stok: "${product.name}". Mevcut: ${availableStock}`,
        });
      }

      resolvedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        name: product.name,
        price: unitPrice,
        discount: unitDiscount,
        quantity: item.quantity,
        image: product.images[0]?.url || '',
        // Effective price per unit after product-level discount
        effectivePrice: Math.max(0, unitPrice - unitDiscount),
      });
    }

    // ── 4. Validate coupon ──
    let coupon = null;
    let couponDiscount = 0;

    const subtotal = resolvedItems.reduce(
      (sum, item) => sum + item.effectivePrice * item.quantity,
      0
    );

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ success: false, error: 'Geçersiz kupon kodu' });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return res.status(400).json({ success: false, error: 'Kupon süresi dolmuş' });
      }
      if (coupon.currentUses >= coupon.maxUses) {
        return res.status(400).json({ success: false, error: 'Kupon kullanım limiti dolmuş' });
      }
      if (subtotal < Number(coupon.minOrder)) {
        return res.status(400).json({
          success: false,
          error: `Minimum sipariş tutarı: ${coupon.minOrder} TL`,
        });
      }

      if (coupon.type === 'percent') {
        couponDiscount = Math.round((subtotal * Number(coupon.discount)) / 100 * 100) / 100;
      } else {
        couponDiscount = Math.min(Number(coupon.discount), subtotal);
      }
    }

    // ── 5. Calculate totals ──
    const discountAmount = couponDiscount;
    const shippingFee = 0; // Free shipping for now
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round(afterDiscount * TAX_RATE * 100) / 100;
    const total = Math.round((afterDiscount + taxAmount + shippingFee) * 100) / 100;

    // ── 6-13. Create order, items, payment in a transaction ──
    const orderNumber = generateOrderNumber();

    const result = await prisma.$transaction(async (tx) => {
      // 7. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'pending_payment',
          subtotal,
          discountAmount,
          shippingFee,
          taxAmount,
          total,
          couponCode: coupon?.code || null,
          customerEmail: shipping.email,
          customerFirstName: shipping.firstName,
          customerLastName: shipping.lastName,
          customerPhone: shipping.phone,
          idempotencyKey: idempotencyKey || null,
        },
      });

      // 8. Create OrderItems with price snapshots
      await tx.orderItem.createMany({
        data: resolvedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
          image: item.image,
        })),
      });

      // 9. Create Payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'paytr',
          status: 'pending',
          amount: total,
          currency: 'TL',
          merchantOid: order.orderNumber,
        },
      });

      // 12. Decrement stock for each item
      for (const item of resolvedItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 13. Increment coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { currentUses: { increment: 1 } },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'order.created',
          entity: 'Order',
          entityId: order.id,
          details: JSON.stringify({ orderNumber, total, itemCount: resolvedItems.length }),
          ip: req.ip || '',
        },
      });

      return { order, payment };
    });

    // 10-11. Call PayTR to get iframe token (outside transaction — external call)
    let iframeToken = null;
    try {
      const paymentResult = await paymentService.createPayment({
        merchantOid: result.order.orderNumber,
        amount: total,
        email: shipping.email,
        userName: `${shipping.firstName} ${shipping.lastName}`,
        userPhone: shipping.phone,
        userAddress: `${shipping.address}, ${shipping.city} ${shipping.zip}`,
        items: resolvedItems.map((i) => ({
          name: i.name,
          price: i.effectivePrice,
          quantity: i.quantity,
        })),
        userIp: req.ip || '127.0.0.1',
      });

      iframeToken = paymentResult.token;

      // Update payment with provider token
      await prisma.payment.update({
        where: { id: result.payment.id },
        data: { providerToken: iframeToken },
      });
    } catch (paymentErr) {
      logger.error('PayTR iframe token error:', paymentErr);
      // Order is created but payment gateway failed — mark as needs attention
    }

    logger.info(`Order created: ${orderNumber} — Total: ${total} TL`);

    res.status(201).json({
      success: true,
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        iframeToken,
        total,
      },
    });
  } catch (err) {
    logger.error('Checkout error:', err);
    res.status(500).json({ success: false, error: 'Sipariş oluşturulamadı' });
  }
});

export default router;
