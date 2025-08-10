import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import requireRole from '../../middleware/requireRole.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import validate from '../../middleware/validate.js';
import { startExamSchema, answerSchema, submitSchema } from '../../validation/exam.schema.js';
import * as ctrl from './exam.controller.js';

const r = Router();
r.use(requireAuth);

r.post('/step/:step/start', validate(startExamSchema), asyncHandler(ctrl.start));
r.get('/step/:step/plan', asyncHandler(ctrl.plan));
r.post('/:id/answer', validate(answerSchema), asyncHandler(ctrl.answer));
r.post('/:id/submit', validate(submitSchema), asyncHandler(ctrl.submit));
r.get('/all', requireRole('ADMIN', 'SUPERVISOR'), asyncHandler(ctrl.listAll));
r.post('/:id/reset', requireRole('ADMIN', 'SUPERVISOR'), asyncHandler(ctrl.reset));
r.get('/:id', asyncHandler(ctrl.getOne));
r.get('/', asyncHandler(ctrl.listMine));

export default r;
