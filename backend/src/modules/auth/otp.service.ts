import { env } from '../../config/env.js';
import { generateOtp } from '../../utils/crypto.js';
import { sendOtpEmail } from '../../utils/mailer.js';
import { sendOtpSms } from '../../utils/sms.js';
import { User } from '../users/user.model.js';

export async function issueOtp(userId: string, email: string, phone?: string) {
  const code = generateOtp(6);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
  await User.findByIdAndUpdate(userId, { otp: { code, expiresAt } });
  try { await sendOtpEmail(email, code); } catch (e) { console.warn('[OTP EMAIL ERROR]', (e as any)?.message ?? e); }
  if (phone) {
    try { await sendOtpSms(phone, code); } catch (e) { console.warn('[OTP SMS ERROR]', (e as any)?.message ?? e); }
  }
}
