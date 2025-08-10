import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import requireRole from '../../middleware/requireRole.js';
import validate from '../../middleware/validate.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import * as ctrl from './question.controller.js';
import { createQuestionSchema, updateQuestionSchema } from '../../validation/question.schema.js';
import { idParam } from '../../validation/common.js';

const r = Router();

r.use(requireAuth);

r.get('/', asyncHandler(ctrl.list));
r.post('/', requireRole('ADMIN'), validate(createQuestionSchema), asyncHandler(ctrl.create));
r.patch('/:id', requireRole('ADMIN'), validate(idParam), validate(updateQuestionSchema), asyncHandler(ctrl.update));
r.delete('/:id', requireRole('ADMIN'), validate(idParam), asyncHandler(ctrl.remove));

export default r;
