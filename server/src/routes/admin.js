import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── Schemas ───────────────────────────────

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled',
    'refunded',
  ]),
});

// ── Routes ────────────────────────────────

// GET /orders — list all orders (admin)
router.get('/orders', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      search,
      dateFrom,
      dateTo,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerFirstName: { contains: search, mode: 'insensitive' } },
        { customerLastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payment: { select: { status: true, provider: true, paidAt: true } },
          user: { select: { id: true, name: true, email: true } },
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
    logger.error('Admin list orders error:', err);
    res.status(500).json({ success: false, error: 'Siparişler yüklenemedi' });
  }
});

// PUT /orders/:id/status — update order status
router.put('/orders/:id/status', validate(updateOrderStatusSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
    }

    const previousStatus = order.status;

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, payment: true },
    });

    // Audit log for status change
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'order.status_updated',
        entity: 'Order',
        entityId: id,
        details: JSON.stringify({ previousStatus, newStatus: status }),
        ip: req.ip || '',
      },
    });

    logger.info(`Order ${order.orderNumber} status: ${previousStatus} → ${status}`);

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update order status error:', err);
    res.status(500).json({ success: false, error: 'Sipariş durumu güncellenemedi' });
  }
});

// GET /dashboard — aggregate stats
router.get('/dashboard', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      revenueResult,
      newOrdersToday,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      // Total orders (excluding cancelled)
      prisma.order.count({
        where: { status: { not: 'cancelled' } },
      }),

      // Total revenue from completed/confirmed orders
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ['confirmed', 'preparing', 'ready', 'completed'] },
        },
      }),

      // New orders today
      prisma.order.count({
        where: { createdAt: { gte: todayStart } },
      }),

      // Top 5 products by order count
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: revenueResult._sum.total || 0,
        newOrdersToday,
        topProducts: topProducts.map((p) => ({
          productId: p.productId,
          name: p.name,
          totalSold: p._sum.quantity,
        })),
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    logger.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, error: 'Dashboard verileri yüklenemedi' });
  }
});

export default router;
