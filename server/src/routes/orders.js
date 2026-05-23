import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Routes ────────────────────────────────

// GET / — list user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = { userId: req.user.userId };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payment: { select: { status: true, provider: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    logger.error('List orders error:', err);
    res.status(500).json({ success: false, error: 'Siparişler yüklenemedi' });
  }
});

// GET /:id — get order detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            amount: true,
            currency: true,
            paidAt: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
    }

    // Users can only see their own orders
    if (order.userId !== req.user.userId && req.user.role === 'customer') {
      return res.status(403).json({ success: false, error: 'Bu siparişe erişim yetkiniz yok' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    logger.error('Get order error:', err);
    res.status(500).json({ success: false, error: 'Sipariş bilgisi alınamadı' });
  }
});

export default router;
