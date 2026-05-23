// ═══════════════════════════════════════════
// Payment Service — Provider Abstraction Layer
// Wraps provider-specific implementations behind a unified interface.
// To switch providers (e.g., from PayTR to iyzico), only this file
// and the provider module need to change.
// ═══════════════════════════════════════════

import { createPaytrToken, verifyPaytrCallback, refundPaytrPayment } from './paytr.js';
import { logger } from '../utils/logger.js';

export const paymentService = {
  /**
   * Create a payment and get the hosted payment form token.
   * @returns {{ success: boolean, token?: string, error?: string }}
   */
  async createPayment({
    merchantOid,
    email,
    amount,
    userName,
    userAddress,
    userPhone,
    userIp,
    items, // Array of { name, price, quantity }
  }) {
    // Format basket for PayTR: [[name, price_kuruş, quantity], ...]
    const userBasket = items.map((item) => [
      item.name,
      String(Math.round(item.price * 100)),
      String(item.quantity),
    ]);

    return createPaytrToken({
      merchantOid,
      email,
      amount,
      userName,
      userAddress,
      userPhone,
      userIp,
      userBasket,
    });
  },

  /**
   * Verify a payment callback from the provider.
   * @returns {boolean}
   */
  verifyCallback(callbackData) {
    const { merchant_oid, status, total_amount, hash } = callbackData;

    return verifyPaytrCallback({
      merchantOid: merchant_oid,
      status,
      totalAmount: total_amount,
      hash,
    });
  },

  /**
   * Parse the callback data into a normalized format.
   * @returns {{ merchantOid: string, status: 'success'|'failed', totalAmount: string, providerTransactionId?: string }}
   */
  parseCallback(callbackData) {
    return {
      merchantOid: callbackData.merchant_oid,
      status: callbackData.status === 'success' ? 'success' : 'failed',
      totalAmount: callbackData.total_amount,
      providerTransactionId: callbackData.payment_id || null,
      rawData: callbackData,
    };
  },

  /**
   * Request a refund from the payment provider.
   * @returns {{ success: boolean, error?: string }}
   */
  async refund({ merchantOid, amount }) {
    return refundPaytrPayment({
      merchantOid,
      returnAmount: amount,
    });
  },

  /**
   * Get the provider name.
   */
  get providerName() {
    return 'paytr';
  },
};
