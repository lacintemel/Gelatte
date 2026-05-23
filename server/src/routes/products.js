import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Schemas ───────────────────────────────

const createProductSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().positive(),
  discount: z.number().min(0).optional().default(0),
  stock: z.number().int().min(0).optional().default(0),
  badge: z.string().nullable().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional().default('active'),
  showInMenu: z.boolean().optional().default(true),
  availableForOnlineOrder: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional().default(''),
    sortOrder: z.number().int().optional().default(0),
  })).optional().default([]),
});

const updateProductSchema = createProductSchema.partial().omit({ images: true }).extend({
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string().url(),
    alt: z.string().optional().default(''),
    sortOrder: z.number().int().optional().default(0),
  })).optional(),
});

// ── Routes ────────────────────────────────

// GET / — list products with filters & pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      status,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

    const where = {};

    // Non-admins only see active, available products
    if (!isAdmin) {
      where.status = 'active';
      where.availableForOnlineOrder = true;
    } else if (status) {
      where.status = status;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    logger.error('List products error:', err);
    res.status(500).json({ success: false, error: 'Ürünler yüklenemedi' });
  }
});

// GET /:id — product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    logger.error('Get product error:', err);
    res.status(500).json({ success: false, error: 'Ürün bilgisi alınamadı' });
  }
});

// POST / — create product (admin)
router.post('/', authenticate, requireAdmin, validate(createProductSchema), async (req, res) => {
  try {
    const { images, ...productData } = req.body;

    const product = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images,
        },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info(`Product created: ${product.name} (${product.id})`);

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    logger.error('Create product error:', err);
    res.status(500).json({ success: false, error: 'Ürün oluşturulamadı' });
  }
});

// PUT /:id — update product (admin)
router.put('/:id', authenticate, requireAdmin, validate(updateProductSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { images, ...productData } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }

    const product = await prisma.$transaction(async (tx) => {
      // If images provided, replace all images
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img) => ({ ...img, productId: id })),
        });
      }

      return tx.product.update({
        where: { id },
        data: productData,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    logger.info(`Product updated: ${product.name} (${product.id})`);

    res.json({ success: true, data: product });
  } catch (err) {
    logger.error('Update product error:', err);
    res.status(500).json({ success: false, error: 'Ürün güncellenemedi' });
  }
});

// DELETE /:id — soft-delete product (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }

    await prisma.product.update({
      where: { id },
      data: { status: 'archived' },
    });

    logger.info(`Product archived: ${existing.name} (${id})`);

    res.json({ success: true, data: { message: 'Ürün arşivlendi' } });
  } catch (err) {
    logger.error('Delete product error:', err);
    res.status(500).json({ success: false, error: 'Ürün silinemedi' });
  }
});

export default router;
