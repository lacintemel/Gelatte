// ═══════════════════════════════════════════
// Gelatte — Express Server Entry Point
// ═══════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { env } from './src/config/env.js';
import { prisma } from './src/config/database.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { logger } from './src/utils/logger.js';

// Route imports
import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import categoryRoutes from './src/routes/categories.js';
import cartRoutes from './src/routes/cart.js';
import orderRoutes from './src/routes/orders.js';
import checkoutRoutes from './src/routes/checkout.js';
import paymentRoutes from './src/routes/payment.js';
import couponRoutes from './src/routes/coupons.js';
import adminRoutes from './src/routes/admin.js';
import reviewsRoutes from './src/routes/reviews.js';
import cmsRoutes from './src/routes/cms.js';
import uploadRoutes from './src/routes/upload.js';

const app = express();
const devOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://127.0.0.1:5173'];

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/+$/, '');
}

function getOriginVariants(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return [];

  try {
    const url = new URL(normalizedOrigin);
    const variants = [normalizedOrigin];

    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      variants.push(url.toString().replace(/\/+$/, ''));
    } else {
      url.hostname = `www.${url.hostname}`;
      variants.push(url.toString().replace(/\/+$/, ''));
    }

    return variants;
  } catch {
    return [normalizedOrigin];
  }
}

const allowedOrigins = new Set([
  ...[...env.CORS_ORIGINS, ...(env.isProduction ? [] : devOrigins)].flatMap(getOriginVariants),
]);

function isVercelOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

// ── Global Middleware ──
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);

    if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin) || isVercelOrigin(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    logger.warn(`CORS blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Parse JSON for most routes
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies (needed for PayTR callback)
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', generalLimiter);

// ── Health Check ──
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/upload', uploadRoutes);

// ── 404 handler ──
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// ── Global Error Handler ──
app.use(errorHandler);

// ── Start Server ──
const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Gelatte API server running on port ${PORT}`);
  logger.info(`📍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Frontend URL: ${env.APP_URL}`);
  logger.info(`🔐 CORS origins: ${Array.from(allowedOrigins).join(', ')}`);
  logger.info(`💳 PayTR test mode: ${env.PAYTR_TEST_MODE === '1' ? 'ON' : 'OFF'}`);
});

export default app;
