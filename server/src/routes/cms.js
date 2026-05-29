import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Validate updating a setting
const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(), // Can be stringified JSON
});

// GET /api/cms — Get all public CMS settings (no auth required)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    // Convert array of {key, value} to an object { key: value }
    const formatted = settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    
    res.json({ success: true, data: formatted });
  } catch (err) {
    logger.warn('CMS settings unavailable; using empty public settings:', err.message);
    res.json({ success: true, data: {} });
  }
});

// POST /api/cms — Upsert a single setting (Admin only)
router.post('/', authenticate, requireAdmin, validate(settingSchema), async (req, res) => {
  try {
    const { key, value } = req.body;

    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json({ success: true, data: setting });
  } catch (err) {
    logger.error('Error saving CMS setting:', err);
    res.status(500).json({ success: false, error: 'İçerik kaydedilemedi' });
  }
});

// POST /api/cms/bulk — Upsert multiple settings at once (Admin only)
const bulkSchema = z.object({
  settings: z.array(settingSchema),
});

router.post('/bulk', authenticate, requireAdmin, validate(bulkSchema), async (req, res) => {
  try {
    const { settings } = req.body;

    // Run all upserts in a transaction
    await prisma.$transaction(
      settings.map((s) =>
        prisma.storeSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        })
      )
    );

    res.json({ success: true });
  } catch (err) {
    logger.error('Error bulk saving CMS settings:', err);
    res.status(500).json({ success: false, error: 'İçerikler toplu olarak kaydedilemedi' });
  }
});

export default router;
