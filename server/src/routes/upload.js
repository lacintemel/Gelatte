import { Router } from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { cloudinary } from '../utils/cloudinary.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Store file in memory to pipe it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    if (!env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured. Please add CLOUDINARY API keys to the server environment.',
      });
    }

    // Upload to Cloudinary using a stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'gelatte' },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return res.status(500).json({ success: false, error: 'Failed to upload image' });
        }
        res.json({ success: true, url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    logger.error('Upload route error:', err);
    res.status(500).json({ success: false, error: 'An unexpected error occurred during upload' });
  }
});

export default router;
