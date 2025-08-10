import { Request, Response } from 'express';
import * as svc from './certificate.service.js';

export async function listMine(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const data = await svc.myCertificates(userId);
  res.json({ ok: true, data });
}

export async function generate(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const { level, examId } = req.body as any;
  const cert = await svc.issueCertificate(userId, level, examId);
  res.status(201).json({ ok: true, data: cert });
}
