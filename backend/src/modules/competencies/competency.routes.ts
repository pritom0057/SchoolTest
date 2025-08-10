import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import requireRole from '../../middleware/requireRole.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import * as ctrl from './competency.controller.js';

const r = Router();

r.use(requireAuth, requireRole('ADMIN'));

r.get('/', asyncHandler(ctrl.list));
r.post('/', asyncHandler(ctrl.create));
r.patch('/:id', asyncHandler(ctrl.update));
r.delete('/:id', asyncHandler(ctrl.remove));

export default r;
