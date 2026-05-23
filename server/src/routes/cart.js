import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Schemas ───────────────────────────────

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// ── Helpers ───────────────────────────────

// Finds or creates a cart for the current user/guest
async function getOrCreateCart(req) {
  const userId = req.user?.userId || null;
  const guestId = req.headers['x-guest-id'] || null;

  if (!userId && !guestId) {
    return null;
  }

  const where = userId ? { userId } : { guestId };

  let cart = await prisma.cart.findFirst({ where });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, guestId },
    });
  }

  return cart;
}

async function getAvailableStock(productId, variantId) {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    return variant?.stock ?? 0;
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  return product?.stock ?? 0;
}

// ── Routes ────────────────────────────────

// GET / — get cart with items
router.get('/', optionalAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    if (!cart) {
      return res.json({ success: true, data: { items: [] } });
    }

    const cartWithItems = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    res.json({ success: true, data: cartWithItems });
  } catch (err) {
    logger.error('Get cart error:', err);
    res.status(500).json({ success: false, error: 'Sepet yüklenemedi' });
  }
});

// POST /items — add item to cart
router.post('/items', optionalAuth, validate(addItemSchema), async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    if (!cart) {
      return res.status(400).json({ success: false, error: 'Sepet kimliği gerekli. Giriş yapın veya x-guest-id gönderin.' });
    }

    const { productId, variantId, quantity } = req.body;

    // Validate product exists and is active
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, error: 'Ürün bulunamadı veya satışta değil' });
    }

    // Validate variant if provided
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || !variant.isActive || variant.productId !== productId) {
        return res.status(404).json({ success: false, error: 'Ürün varyantı bulunamadı' });
      }
    }

    // Check stock
    const stock = await getAvailableStock(productId, variantId);
    if (stock < quantity) {
      return res.status(400).json({ success: false, error: `Yetersiz stok. Mevcut: ${stock}` });
    }

    // Upsert cart item (if same product+variant already in cart, add quantity)
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    let item;
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > stock) {
        return res.status(400).json({ success: false, error: `Yetersiz stok. Mevcut: ${stock}` });
      }
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
        include: { product: true, variant: true },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
        include: { product: true, variant: true },
      });
    }

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    logger.error('Add to cart error:', err);
    res.status(500).json({ success: false, error: 'Ürün sepete eklenemedi' });
  }
});

// PUT /items/:id — update cart item quantity
router.put('/items/:id', optionalAuth, validate(updateItemSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Sepet öğesi bulunamadı' });
    }

    // Verify ownership
    const userId = req.user?.userId;
    const guestId = req.headers['x-guest-id'];
    if (cartItem.cart.userId !== userId && cartItem.cart.guestId !== guestId) {
      return res.status(403).json({ success: false, error: 'Bu sepet öğesine erişim yetkiniz yok' });
    }

    // Check stock
    const stock = await getAvailableStock(cartItem.productId, cartItem.variantId);
    if (stock < quantity) {
      return res.status(400).json({ success: false, error: `Yetersiz stok. Mevcut: ${stock}` });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true, variant: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update cart item error:', err);
    res.status(500).json({ success: false, error: 'Sepet öğesi güncellenemedi' });
  }
});

// DELETE /items/:id — remove item from cart
router.delete('/items/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, error: 'Sepet öğesi bulunamadı' });
    }

    // Verify ownership
    const userId = req.user?.userId;
    const guestId = req.headers['x-guest-id'];
    if (cartItem.cart.userId !== userId && cartItem.cart.guestId !== guestId) {
      return res.status(403).json({ success: false, error: 'Bu sepet öğesine erişim yetkiniz yok' });
    }

    await prisma.cartItem.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Ürün sepetten kaldırıldı' } });
  } catch (err) {
    logger.error('Remove cart item error:', err);
    res.status(500).json({ success: false, error: 'Ürün sepetten kaldırılamadı' });
  }
});

// DELETE / — clear entire cart
router.delete('/', optionalAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    if (!cart) {
      return res.json({ success: true, data: { message: 'Sepet zaten boş' } });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.json({ success: true, data: { message: 'Sepet temizlendi' } });
  } catch (err) {
    logger.error('Clear cart error:', err);
    res.status(500).json({ success: false, error: 'Sepet temizlenemedi' });
  }
});

export default router;
