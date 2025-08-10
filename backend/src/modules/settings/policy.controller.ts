import { Request, Response } from 'express';
import { Policy } from './policy.model.js';

export async function get(_req: Request, res: Response) {
    const doc = await Policy.findOne().lean();
    res.json({ ok: true, data: doc });
}

export async function set(req: Request, res: Response) {
    const body = req.body as any;
    const doc = await Policy.findOneAndUpdate({}, body, { upsert: true, new: true });
    res.json({ ok: true, data: doc });
}
