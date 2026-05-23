import { createHash } from 'node:crypto';

const HEADER_NAME = 'x-idempotency-key';

/**
 * Extract or generate an idempotency key from the request.
 * If the client provides an X-Idempotency-Key header, that value is used.
 * Otherwise, a deterministic key is generated from the request body
 * so that identical order submissions produce the same key.
 *
 * @param {import('express').Request} req
 * @returns {string} The idempotency key.
 */
export function getIdempotencyKey(req) {
  const clientKey = req.headers[HEADER_NAME];
  if (clientKey) return clientKey;

  // Generate a deterministic key from the user ID + sorted body content
  const userId = req.user?.id || 'anonymous';
  const bodyStr = JSON.stringify(req.body || {});
  const raw = `${userId}:${bodyStr}`;

  return createHash('sha256').update(raw).digest('hex');
}
