import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

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

// ── User / Staff Management ────────────────

const createUserSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  name: z.string().min(1, 'İsim gerekli'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  role: z.enum(['admin', 'customer', 'superadmin']).default('admin'),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'customer', 'superadmin']).optional(),
  phone: z.string().optional(),
});

// GET /api/admin/users — List all users/staff
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: 'Kullanıcılar yüklenemedi' });
  }
});

// POST /api/admin/users — Create a new user (Staff/Admin)
router.post('/users', validate(createUserSchema), async (req, res) => {
  try {
    const { email, name, password, role, phone } = req.body;

    // Only superadmins can create other superadmins
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Superadmin oluşturma yetkiniz yok' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role, phone },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    logger.error('Error creating user:', err);
    res.status(500).json({ success: false, error: 'Kullanıcı oluşturulamadı' });
  }
});

// PUT /api/admin/users/:id — Update a user
router.put('/users/:id', validate(updateUserSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only superadmin can modify superadmins
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });

    if (targetUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Superadmin yetkilerini değiştiremezsiniz' });
    }

    // Only superadmin can promote someone to superadmin
    if (updates.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Superadmin yetkisi veremezsiniz' });
    }

    const data = { ...updates };
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    logger.error('Error updating user:', err);
    res.status(500).json({ success: false, error: 'Kullanıcı güncellenemedi' });
  }
});

// DELETE /api/admin/users/:id — Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });

    if (targetUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Superadmin silemezsiniz' });
    }

    // Prevent deleting oneself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Kendi hesabınızı silemezsiniz' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: 'Kullanıcı silinemedi' });
  }
});

export default router;
