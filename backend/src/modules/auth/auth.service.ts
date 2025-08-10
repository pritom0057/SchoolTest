import { User } from '../users/user.model.js';
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/crypto.js';
import { issueOtp } from './otp.service.js';
import { TokenPair } from './auth.types.js';

export async function register(name: string, email: string, password: string, phone?: string) {
  const exists = await User.findOne({ email });
  if (exists) {
    // If user exists but not verified, refresh details and re-issue OTP instead of blocking registration
    if (!exists.emailVerifiedAt) {
      exists.name = name || exists.name;
      if (phone) exists.phone = phone as any;
      exists.passwordHash = await hashPassword(password);
      await exists.save();
      await issueOtp(exists.id, exists.email, exists.phone as string);
      return exists;
    }
    throw Object.assign(new Error('Email already registered'), { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, phone });
  await issueOtp(user.id, user.email, user.phone as string);
  return user;
}

export async function verifyOtp(email: string, code: string) {
  const user = await User.findOne({ email });
  if (!user || !user.otp?.code) throw Object.assign(new Error('Invalid OTP'), { status: 400 });
  if (user.otp.code !== code || !user.otp.expiresAt || user.otp.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
  }
  user.emailVerifiedAt = new Date();
  user.otp = undefined as any;
  await user.save();
  return true;
}

export async function login(email: string, password: string, userAgent?: string): Promise<TokenPair> {
  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  // If not verified, re-issue OTP and prevent login
  if (!user.emailVerifiedAt) {
    await issueOtp(user.id, user.email, user.phone as string);
    throw Object.assign(new Error('Account not verified. OTP sent.'), { status: 403 });
  }

  const payload = { sub: user.id, role: user.role, email: user.email, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokens.push({ token: refreshToken, userAgent, createdAt: new Date() } as any);
  await user.save();

  return { accessToken, refreshToken };
}

export async function refresh(oldToken: string): Promise<TokenPair> {
  const payload = verifyRefreshToken(oldToken) as any;
  const user = await User.findById(payload.sub);
  if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  const found = user.refreshTokens.find(rt => rt.token === oldToken && !rt.revokedAt);
  if (!found) throw Object.assign(new Error('Token revoked'), { status: 401 });

  // rotate
  found.revokedAt = new Date();
  const newPayload = { sub: user.id, role: user.role, email: user.email, name: user.name };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);
  user.refreshTokens.push({ token: refreshToken, createdAt: new Date() } as any);
  await user.save();

  return { accessToken, refreshToken };
}

export async function logout(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken) as any;
    await User.updateOne(
      { _id: payload.sub, 'refreshTokens.token': refreshToken },
      { $set: { 'refreshTokens.$.revokedAt': new Date() } }
    );
  } catch {
    // ignore invalid token on logout
  }
}
