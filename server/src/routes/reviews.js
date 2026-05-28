import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ── Schemas ──
const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().default(''),
});

// GET /api/reviews/product/:id — Get all reviews for a product
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    logger.error('Error fetching product reviews:', err);
    res.status(500).json({ success: false, error: 'Yorumlar yüklenemedi' });
  }
});

// POST /api/reviews — Create a review (requires authentication)
router.post('/', authenticate, validate(createReviewSchema), async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: review });
  } catch (err) {
    logger.error('Error creating review:', err);
    res.status(500).json({ success: false, error: 'Yorum eklenemedi' });
  }
});

// GET /api/reviews/admin/all — Get all reviews (for admin dashboard)
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    logger.error('Error fetching all reviews for admin:', err);
    res.status(500).json({ success: false, error: 'Yorumlar yüklenemedi' });
  }
});

// DELETE /api/reviews/:id — Delete a review (Admin or owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ success: false, error: 'Yorum bulunamadı' });
    }

    // Only allow admin or the review author to delete
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && review.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting review:', err);
    res.status(500).json({ success: false, error: 'Yorum silinemedi' });
  }
});

export default router;
