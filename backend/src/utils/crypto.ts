import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'node:crypto';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: object) {
  return jwt.sign(payload as any, env.JWT_ACCESS_SECRET as unknown as Secret, { expiresIn: env.ACCESS_TTL as any } as SignOptions);
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload as any, env.JWT_REFRESH_SECRET as unknown as Secret, { expiresIn: env.REFRESH_TTL as any } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
}

export function generateOtp(length = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

export function randomId(prefix = '') {
  return prefix + crypto.randomBytes(6).toString('hex');
}
