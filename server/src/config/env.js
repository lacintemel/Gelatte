import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'APP_URL',
  'API_URL',
];

const paytrVars = [
  'PAYTR_MERCHANT_ID',
  'PAYTR_MERCHANT_KEY',
  'PAYTR_MERCHANT_SALT',
  'PAYTR_TEST_MODE',
  'PAYTR_SUCCESS_URL',
  'PAYTR_FAIL_URL',
  'PAYTR_CALLBACK_URL',
];

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Validate core required vars
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// PayTR vars: required in production, warn in development
const missingPaytr = paytrVars.filter((key) => !process.env[key]);
if (missingPaytr.length > 0) {
  if (isProduction) {
    throw new Error(`Missing required PayTR environment variables: ${missingPaytr.join(', ')}`);
  } else {
    console.warn(
      `[env] Warning: Missing PayTR environment variables: ${missingPaytr.join(', ')}. ` +
      'Payment features will not work until these are configured.'
    );
  }
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(process.env.PORT, 10) || 3001,

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  APP_URL: process.env.APP_URL,
  API_URL: process.env.API_URL,

  PAYTR_MERCHANT_ID: process.env.PAYTR_MERCHANT_ID || '',
  PAYTR_MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY || '',
  PAYTR_MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT || '',
  PAYTR_TEST_MODE: process.env.PAYTR_TEST_MODE || '1',
  PAYTR_SUCCESS_URL: process.env.PAYTR_SUCCESS_URL || '',
  PAYTR_FAIL_URL: process.env.PAYTR_FAIL_URL || '',
  PAYTR_CALLBACK_URL: process.env.PAYTR_CALLBACK_URL || '',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  PAYMENT_RATE_LIMIT_MAX: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX, 10) || 10,

  isProduction,
  isDevelopment: nodeEnv === 'development',
};
