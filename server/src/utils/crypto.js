import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Generate an HMAC-SHA256 hash.
 * @param {string} data - The data to hash.
 * @param {string} secret - The secret key.
 * @returns {string} Hex-encoded HMAC digest.
 */
export function hmacSHA256(data, secret) {
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Generate a random order number in the format GL-XXXXXX.
 * @returns {string} A unique order number.
 */
export function generateOrderNumber() {
  const hex = randomBytes(3).toString('hex').toUpperCase();
  return `GL-${hex}`;
}

/**
 * Constant-time comparison of two strings/buffers to prevent timing attacks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}
