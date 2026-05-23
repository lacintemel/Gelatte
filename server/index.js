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

const app = express();

// ── Global Middleware ──
app.use(cors({
  origin: env.APP_URL,
  credentials: true,
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

// ── 404 handler ──
app.use('/api/*', (req, res) => {
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
  logger.info(`💳 PayTR test mode: ${env.PAYTR_TEST_MODE === '1' ? 'ON' : 'OFF'}`);
});

export default app;
