import { Request, Response } from 'express';
import * as svc from './auth.service.js';
import { setRefreshCookie, clearRefreshCookie } from '../../middleware/tokenCookie.js';
import { env } from '../../config/env.js';
import { User } from '../users/user.model.js';

export async function register(req: Request, res: Response) {
  const { name, email, password, phone } = req.body;
  const user = await svc.register(name, email, password, phone);
  let otp: string | undefined;
  if (env.NODE_ENV !== 'production') {
    try {
      const u = await User.findById(user.id).select('otp').lean();
      // @ts-ignore
      otp = u?.otp?.code as string | undefined;
    } catch { }
  }
  res.status(201).json({ ok: true, message: 'Registered. OTP sent.', data: { id: user.id, email: user.email, otp } });
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body;
  await svc.verifyOtp(email, otp);
  res.json({ ok: true, message: 'Email verified.' });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const pair = await svc.login(email, password, req.headers['user-agent']);
  // Set HttpOnly refresh cookie and return only access token in body
  setRefreshCookie(res, pair.refreshToken);
  res.json({ ok: true, accessToken: pair.accessToken });
}

export async function refresh(req: Request, res: Response) {
  const cookieToken = (req as any).cookies?.refreshToken as string | undefined;
  if (!cookieToken) return res.status(401).json({ ok: false, error: 'No refresh token' });
  const pair = await svc.refresh(cookieToken);
  setRefreshCookie(res, pair.refreshToken);
  res.json({ ok: true, accessToken: pair.accessToken });
}

export async function logout(req: Request, res: Response) {
  const cookieToken = (req as any).cookies?.refreshToken as string | undefined;
  if (cookieToken) {
    await svc.logout(cookieToken);
  }
  clearRefreshCookie(res);
  res.json({ ok: true });
}
