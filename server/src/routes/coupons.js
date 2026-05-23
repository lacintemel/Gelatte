import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Schemas ───────────────────────────────

const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().positive(),
});

const createCouponSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase()),
  type: z.enum(['percent', 'fixed']).default('percent'),
  discount: z.number().positive(),
  minOrder: z.number().min(0).default(0),
  maxUses: z.number().int().positive().default(999),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  isActive: z.boolean().default(true),
});

const updateCouponSchema = createCouponSchema.partial();

// ── Routes ────────────────────────────────

// POST /validate — validate a coupon code
router.post('/validate', optionalAuth, validate(validateCouponSchema), async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.json({ success: true, data: { valid: false, error: 'Geçersiz kupon kodu' } });
    }

    const now = new Date();

    if (now < coupon.validFrom || now > coupon.validTo) {
      return res.json({ success: true, data: { valid: false, error: 'Kupon süresi dolmuş' } });
    }

    if (coupon.currentUses >= coupon.maxUses) {
      return res.json({ success: true, data: { valid: false, error: 'Kupon kullanım limiti dolmuş' } });
    }

    if (orderTotal < Number(coupon.minOrder)) {
      return res.json({
        success: true,
        data: {
          valid: false,
          error: `Minimum sipariş tutarı: ${coupon.minOrder} TL`,
        },
      });
    }

    // Calculate discount
    let discountAmount;
    if (coupon.type === 'percent') {
      discountAmount = Math.round((orderTotal * Number(coupon.discount)) / 100 * 100) / 100;
    } else {
      discountAmount = Math.min(Number(coupon.discount), orderTotal);
    }

    res.json({
      success: true,
      data: {
        valid: true,
        discount: discountAmount,
        coupon: {
          code: coupon.code,
          type: coupon.type,
          discount: coupon.discount,
        },
      },
    });
  } catch (err) {
    logger.error('Validate coupon error:', err);
    res.status(500).json({ success: false, error: 'Kupon doğrulanamadı' });
  }
});

// GET / — list all coupons (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: coupons });
  } catch (err) {
    logger.error('List coupons error:', err);
    res.status(500).json({ success: false, error: 'Kuponlar yüklenemedi' });
  }
});

// POST / — create coupon (admin)
router.post('/', authenticate, requireAdmin, validate(createCouponSchema), async (req, res) => {
  try {
    const existing = await prisma.coupon.findUnique({ where: { code: req.body.code } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Bu kupon kodu zaten mevcut' });
    }

    const coupon = await prisma.coupon.create({ data: req.body });

    logger.info(`Coupon created: ${coupon.code}`);

    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    logger.error('Create coupon error:', err);
    res.status(500).json({ success: false, error: 'Kupon oluşturulamadı' });
  }
});

// PUT /:id — update coupon (admin)
router.put('/:id', authenticate, requireAdmin, validate(updateCouponSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Kupon bulunamadı' });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: req.body,
    });

    logger.info(`Coupon updated: ${coupon.code}`);

    res.json({ success: true, data: coupon });
  } catch (err) {
    logger.error('Update coupon error:', err);
    res.status(500).json({ success: false, error: 'Kupon güncellenemedi' });
  }
});

// DELETE /:id — delete coupon (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Kupon bulunamadı' });
    }

    await prisma.coupon.delete({ where: { id } });

    logger.info(`Coupon deleted: ${existing.code}`);

    res.json({ success: true, data: { message: 'Kupon silindi' } });
  } catch (err) {
    logger.error('Delete coupon error:', err);
    res.status(500).json({ success: false, error: 'Kupon silinemedi' });
  }
});

export default router;
