import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import requireRole from '../../middleware/requireRole.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { seedCompetenciesIfEmpty, seedQuestionsIfEmpty } from '../questions/seed.js';

const r = Router();

r.use(requireAuth, requireRole('ADMIN'));

r.post('/competencies', asyncHandler(async (_req, res) => {
    await seedCompetenciesIfEmpty();
    res.json({ ok: true });
}));

r.post('/questions', asyncHandler(async (_req, res) => {
    await seedQuestionsIfEmpty();
    res.json({ ok: true });
}));

r.post('/all', asyncHandler(async (_req, res) => {
    await seedCompetenciesIfEmpty();
    await seedQuestionsIfEmpty();
    res.json({ ok: true });
}));

export default r;
