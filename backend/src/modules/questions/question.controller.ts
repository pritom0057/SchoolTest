import { Request, Response } from 'express';
import * as svc from './question.service.js';
import { parsePagination } from '../../utils/pagination.js';

export async function create(req: Request, res: Response) {
  const q = await svc.createQuestion(req.body);
  res.status(201).json({ ok: true, data: q });
}

export async function list(req: Request, res: Response) {
  const { page, skip, limit } = parsePagination(req.query);
  const filter: any = {};
  if (req.query.level) filter.level = req.query.level;
  if (req.query.competency) filter.competency = req.query.competency;
  if (req.query.active !== undefined) filter.active = req.query.active === 'true';
  const [items, total] = await Promise.all([
    svc.listQuestions(filter, { skip, limit }),
    svc.countQuestions(filter),
  ]);
  res.json({ ok: true, data: items, page, limit, total, pages: Math.ceil(total / limit) });
}

export async function update(req: Request, res: Response) {
  const item = await svc.updateQuestion(req.params.id, req.body);
  res.json({ ok: true, data: item });
}

export async function remove(req: Request, res: Response) {
  await svc.deleteQuestion(req.params.id);
  res.json({ ok: true });
}
