import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import requireRole from '../../middleware/requireRole.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import * as ctrl from './policy.controller.js';

const r = Router();

r.use(requireAuth, requireRole('ADMIN'));

r.get('/', asyncHandler(ctrl.get));
r.post('/', asyncHandler(ctrl.set));

export default r;
