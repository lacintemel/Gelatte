import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Schemas ───────────────────────────────

const createCategorySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  label: z.string().min(1),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateCategorySchema = createCategorySchema.partial();

// ── Routes ────────────────────────────────

// GET / — list active categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: categories });
  } catch (err) {
    logger.error('List categories error:', err);
    res.status(500).json({ success: false, error: 'Kategoriler yüklenemedi' });
  }
});

// POST / — create category (admin)
router.post('/', authenticate, requireAdmin, validate(createCategorySchema), async (req, res) => {
  try {
    const existing = await prisma.productCategory.findUnique({ where: { slug: req.body.slug } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Bu slug zaten kullanılıyor' });
    }

    const category = await prisma.productCategory.create({ data: req.body });

    logger.info(`Category created: ${category.label} (${category.slug})`);

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    logger.error('Create category error:', err);
    res.status(500).json({ success: false, error: 'Kategori oluşturulamadı' });
  }
});

// PUT /:id — update category (admin)
router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.productCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Kategori bulunamadı' });
    }

    // If slug is changing, check for conflicts
    if (req.body.slug && req.body.slug !== existing.slug) {
      const conflict = await prisma.productCategory.findUnique({ where: { slug: req.body.slug } });
      if (conflict) {
        return res.status(409).json({ success: false, error: 'Bu slug zaten kullanılıyor' });
      }
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: req.body,
    });

    logger.info(`Category updated: ${category.label} (${category.id})`);

    res.json({ success: true, data: category });
  } catch (err) {
    logger.error('Update category error:', err);
    res.status(500).json({ success: false, error: 'Kategori güncellenemedi' });
  }
});

// DELETE /:id — delete category (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Kategori bulunamadı' });
    }

    if (existing._count.products > 0) {
      return res.status(400).json({
        success: false,
        error: 'Bu kategoriye ait ürünler var. Önce ürünleri başka bir kategoriye taşıyın.',
      });
    }

    await prisma.productCategory.delete({ where: { id } });

    logger.info(`Category deleted: ${existing.label} (${id})`);

    res.json({ success: true, data: { message: 'Kategori silindi' } });
  } catch (err) {
    logger.error('Delete category error:', err);
    res.status(500).json({ success: false, error: 'Kategori silinemedi' });
  }
});

export default router;
