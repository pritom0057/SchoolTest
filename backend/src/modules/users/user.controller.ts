import { Request, Response } from 'express';
import { User } from './user.model.js';
import { Exam } from '../exams/exam.model.js';
import { studentProgress } from '../exams/exam.service.js';

export async function me(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const user = await User.findById(userId).select('-passwordHash -otp -refreshTokens');
  // Compute assessment summary from exams
  let eligibleStep: 1 | 2 | 3 = 1 as const;
  let highestLevel: any = null;
  let perStep: any = undefined;
  try {
    const exams = await Exam.find({ userId }).lean();
    // Include per-step submitted progress from DB
    try { perStep = await studentProgress(userId) } catch { /* ignore */ }
    if (exams && exams.length > 0) {
      // eligible step moves forward if previous step exam has nextStepUnlocked and is submitted
      const submitted = (e: any) => e.status === 'SUBMITTED' || e.status === 'AUTO_SUBMITTED';
      if (exams.some((e: any) => e.step === 1 && submitted(e) && e.nextStepUnlocked)) eligibleStep = 2;
      if (exams.some((e: any) => e.step === 2 && submitted(e) && e.nextStepUnlocked)) eligibleStep = 3;
      // compute highest awarded level across exams
      const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const awarded = exams.map((e: any) => e.awardedLevel).filter(Boolean);
      if (awarded.length) {
        highestLevel = awarded.sort((a: any, b: any) => order.indexOf(a) - order.indexOf(b)).pop() ?? null;
      }
    } else {
      // No exams yet: default to policy baseline → eligible for Step 1 only, no highest level
      eligibleStep = 1;
      highestLevel = null;
    }
  } catch {
    // ignore summary errors
  }
  const out = user ? (user.toObject ? user.toObject() : user) : null;
  const assessment = { eligibleStep, highestLevel, perStep } as any;
  res.json({ ok: true, data: out ? { ...out, assessment } : out });
}

export async function listUsers(req: Request, res: Response) {
  const users = await User.find().select('-passwordHash -otp -refreshTokens').lean();
  res.json({ ok: true, data: users });
}

export async function updateRole(req: Request, res: Response) {
  const { userId, role } = req.body as any;
  if (!userId || !role) return res.status(400).json({ ok: false, error: 'userId and role are required' });
  if (!['ADMIN', 'STUDENT', 'SUPERVISOR'].includes(role)) return res.status(400).json({ ok: false, error: 'Invalid role' });
  const me = (req as any).user;
  if (!me || me.role !== 'ADMIN') return res.status(403).json({ ok: false, error: 'Forbidden' });
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash -otp -refreshTokens');
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, data: user });
}
