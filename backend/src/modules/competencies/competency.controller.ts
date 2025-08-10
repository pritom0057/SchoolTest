import { Request, Response } from 'express';
import { Competency } from './competency.model.js';

export async function list(_req: Request, res: Response) {
    const items = await Competency.find().sort({ name: 1 }).lean();
    res.json({ ok: true, data: items });
}

export async function create(req: Request, res: Response) {
    const { name, description, active } = req.body as any;
    const item = await Competency.create({ name, description, active });
    res.status(201).json({ ok: true, data: item });
}

export async function update(req: Request, res: Response) {
    const { id } = req.params as any;
    const { name, description, active } = req.body as any;
    const item = await Competency.findByIdAndUpdate(id, { name, description, active }, { new: true });
    res.json({ ok: true, data: item });
}

export async function remove(req: Request, res: Response) {
    const { id } = req.params as any;
    await Competency.findByIdAndDelete(id);
    res.json({ ok: true });
}
