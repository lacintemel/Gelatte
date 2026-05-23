// ═══════════════════════════════════════════
// PayTR Payment Service
// Handles token generation, callback verification, and refunds
// ═══════════════════════════════════════════

import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token';
const PAYTR_REFUND_URL = 'https://www.paytr.com/odeme/iade';

/**
 * Generate the PayTR iframe token for a payment.
 * This is the core integration point — the token is used to render
 * the secure payment iframe on the frontend.
 */
export async function createPaytrToken({
  merchantOid,
  email,
  amount, // in kuruş (1 TL = 100 kuruş)
  userName,
  userAddress,
  userPhone,
  userIp,
  userBasket, // JSON array of [name, price, quantity]
  successUrl,
  failUrl,
  callbackUrl,
}) {
  const merchantId = env.PAYTR_MERCHANT_ID;
  const merchantKey = env.PAYTR_MERCHANT_KEY;
  const merchantSalt = env.PAYTR_MERCHANT_SALT;
  const testMode = env.PAYTR_TEST_MODE;

  // PayTR requires amount in kuruş (integer, no decimals)
  const paymentAmount = Math.round(amount * 100);

  // Basket must be base64 encoded
  const basketEncoded = Buffer.from(JSON.stringify(userBasket)).toString('base64');

  const noInstallment = '0'; // Allow installments
  const maxInstallment = '12';
  const currency = 'TL';
  const lang = 'tr';

  // Generate the hash string per PayTR documentation
  const hashStr = [
    merchantId,
    userIp,
    merchantOid,
    email,
    paymentAmount,
    basketEncoded,
    noInstallment,
    maxInstallment,
    currency,
    testMode,
  ].join('');

  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr + merchantSalt)
    .digest('base64');

  const params = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: String(paymentAmount),
    paytr_token: paytrToken,
    user_basket: basketEncoded,
    debug_on: testMode === '1' ? '1' : '0',
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: successUrl || env.PAYTR_SUCCESS_URL,
    merchant_fail_url: failUrl || env.PAYTR_FAIL_URL,
    timeout_limit: '30',
    currency,
    lang,
    test_mode: testMode,
  });

  logger.payment(`Creating PayTR token for order ${merchantOid}, amount: ${paymentAmount} kuruş`);

  try {
    const response = await fetch(PAYTR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.status === 'success') {
      logger.payment(`PayTR token created successfully for order ${merchantOid}`);
      return { success: true, token: data.token };
    }

    logger.error(`PayTR token creation failed for order ${merchantOid}: ${data.reason}`);
    return { success: false, error: data.reason || 'Token creation failed' };
  } catch (error) {
    logger.error(`PayTR API error for order ${merchantOid}: ${error.message}`);
    return { success: false, error: 'Payment service unavailable' };
  }
}

/**
 * Verify the PayTR callback hash.
 * PayTR sends a POST to our callback URL after payment.
 * We must verify the hash to ensure the request is authentic.
 */
export function verifyPaytrCallback({ merchantOid, status, totalAmount, hash }) {
  const merchantKey = env.PAYTR_MERCHANT_KEY;
  const merchantSalt = env.PAYTR_MERCHANT_SALT;

  const hashStr = merchantOid + merchantSalt + status + totalAmount;
  const expectedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  );

  if (!isValid) {
    logger.error(`PayTR callback hash verification FAILED for order ${merchantOid}`);
  }

  return isValid;
}

/**
 * Request a refund from PayTR.
 * Can be full or partial refund.
 */
export async function refundPaytrPayment({ merchantOid, returnAmount }) {
  const merchantId = env.PAYTR_MERCHANT_ID;
  const merchantKey = env.PAYTR_MERCHANT_KEY;
  const merchantSalt = env.PAYTR_MERCHANT_SALT;

  // Amount in kuruş
  const refundAmount = Math.round(returnAmount * 100);

  const hashStr = merchantId + merchantOid + refundAmount + merchantSalt;
  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64');

  const params = new URLSearchParams({
    merchant_id: merchantId,
    merchant_oid: merchantOid,
    return_amount: String(refundAmount),
    paytr_token: paytrToken,
  });

  logger.payment(`Requesting PayTR refund for order ${merchantOid}, amount: ${refundAmount} kuruş`);

  try {
    const response = await fetch(PAYTR_REFUND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.status === 'success') {
      logger.payment(`PayTR refund successful for order ${merchantOid}`);
      return { success: true };
    }

    logger.error(`PayTR refund failed for order ${merchantOid}: ${data.err_msg}`);
    return { success: false, error: data.err_msg || 'Refund failed' };
  } catch (error) {
    logger.error(`PayTR refund API error for order ${merchantOid}: ${error.message}`);
    return { success: false, error: 'Refund service unavailable' };
  }
}
