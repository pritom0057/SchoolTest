import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isPlaceholder = (v?: string) => v === '...' || v === 'mock';
const mailEnabled = !!(env.MAIL_HOST && !isPlaceholder(env.MAIL_HOST));

export const transporter = nodemailer.createTransport({
  host: mailEnabled ? env.MAIL_HOST : undefined,
  port: mailEnabled ? env.MAIL_PORT : undefined,
  auth: mailEnabled && env.MAIL_USER && env.MAIL_PASS ? { user: env.MAIL_USER, pass: env.MAIL_PASS } : undefined,
} as any);

export async function sendOtpEmail(to: string, otp: string) {
  if (!mailEnabled) {
    console.log(`[MAIL MOCK] To: ${to} OTP: ${otp}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject: 'Your Test School OTP',
      text: `Your OTP is ${otp}. It expires in ${env.OTP_TTL_MINUTES} minutes.`,
    });
  } catch (err) {
    console.warn('[MAIL ERROR] Falling back to mock. Reason:', (err as any)?.message ?? err);
    console.log(`[MAIL MOCK] To: ${to} OTP: ${otp}`);
  }
}
