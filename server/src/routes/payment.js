import { Router } from 'express';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { paymentService } from '../services/payment.js';

const router = Router();

// ── POST /callback — PayTR server-to-server callback ──
// NO auth middleware — PayTR calls this directly
router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;

    logger.info(`Payment callback received for merchant_oid: ${callbackData.merchant_oid}`);

    // 1. Verify hash/signature
    const isValid = paymentService.verifyCallback(callbackData);
    if (!isValid) {
      logger.error('Payment callback hash verification failed', {
        merchant_oid: callbackData.merchant_oid,
      });
      // PayTR expects 'OK' regardless
      return res.status(200).send('OK');
    }

    const merchantOid = callbackData.merchant_oid;
    const status = callbackData.status; // 'success' or 'failed'
    const totalAmount = callbackData.total_amount;

    // 2. Find payment by merchantOid
    const payment = await prisma.payment.findUnique({
      where: { merchantOid },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    if (!payment) {
      logger.error(`Payment not found for merchant_oid: ${merchantOid}`);
      return res.status(200).send('OK');
    }

    // 3. Check if already processed (idempotency)
    if (payment.status === 'completed' || payment.status === 'failed') {
      logger.info(`Payment already processed: ${merchantOid} (${payment.status})`);
      return res.status(200).send('OK');
    }

    // 4. Process based on status
    if (status === 'success') {
      await prisma.$transaction(async (tx) => {
        // Update Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            providerTransactionId: callbackData.payment_type || null,
            paidAt: new Date(),
          },
        });

        // Update Order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'confirmed' },
        });

        // Store raw callback data
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'callback',
            status: 'success',
            rawData: JSON.stringify(callbackData),
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            action: 'payment.callback',
            entity: 'Payment',
            entityId: payment.id,
            details: JSON.stringify({
              merchantOid,
              status: 'success',
              totalAmount,
            }),
          },
        });
      });

      logger.info(`Payment successful: ${merchantOid}`);
    } else {
      // Payment failed — restore stock
      await prisma.$transaction(async (tx) => {
        // Update Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'failed',
            failedAt: new Date(),
          },
        });

        // Update Order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'cancelled' },
        });

        // Restore stock for each order item
        for (const item of payment.order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Store raw callback data
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'callback',
            status: 'failed',
            rawData: JSON.stringify(callbackData),
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            action: 'payment.callback',
            entity: 'Payment',
            entityId: payment.id,
            details: JSON.stringify({
              merchantOid,
              status: 'failed',
              totalAmount,
              failReason: callbackData.failed_reason_code || '',
            }),
          },
        });
      });

      logger.warn(`Payment failed: ${merchantOid}`);
    }

    // MUST respond with plain text 'OK'
    res.status(200).send('OK');
  } catch (err) {
    logger.error('Payment callback error:', err);
    // Still respond OK so PayTR doesn't retry indefinitely
    res.status(200).send('OK');
  }
});

// ── GET /success — redirect landing after successful payment ──
router.get('/success', (req, res) => {
  const orderParam = req.query.merchant_oid || req.query.order || '';
  res.redirect(`${env.APP_URL}/payment/success?order=${encodeURIComponent(orderParam)}`);
});

// ── GET /fail — redirect landing after failed payment ──
router.get('/fail', (req, res) => {
  const orderParam = req.query.merchant_oid || req.query.order || '';
  res.redirect(`${env.APP_URL}/payment/fail?order=${encodeURIComponent(orderParam)}`);
});

export default router;
