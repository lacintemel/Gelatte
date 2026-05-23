import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Global error handler middleware.
 * Normalizes various error types into a consistent JSON response.
 */
export function errorHandler(err, req, res, _next) {
  logger.error(`${req.method} ${req.originalUrl}`, err.message);

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      return res.status(409).json({
        success: false,
        message: `A record with this ${target || 'value'} already exists`,
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.isProduction
    ? 'Internal server error'
    : err.message || 'Internal server error';

  if (statusCode === 500) {
    logger.error('Unhandled error:', err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
