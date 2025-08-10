import * as dotenv from 'dotenv';
dotenv.config();

function get(key: string, fallback?: string) {
  const v = process.env[key];
  if (v === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env var ${key}`);
  }
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(get('PORT', '8080')),
  MONGODB_URI: get('MONGODB_URI', 'mongodb://127.0.0.1:27017/test_school'),
  JWT_ACCESS_SECRET: get('JWT_ACCESS_SECRET', 'dev-access-secret'),
  JWT_REFRESH_SECRET: get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
  ACCESS_TTL: get('ACCESS_TTL', '15m'),
  REFRESH_TTL: get('REFRESH_TTL', '30d'),
  OTP_TTL_MINUTES: Number(get('OTP_TTL_MINUTES', '10')),
  PER_QUESTION_SECONDS: Number(get('PER_QUESTION_SECONDS', '60')),
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM ?? 'Test School <noreply@testschool.local>',
};
