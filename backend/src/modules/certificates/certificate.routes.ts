import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import * as ctrl from './certificate.controller.js';

const r = Router();
r.use(requireAuth);

r.get('/me', asyncHandler(ctrl.listMine));
r.post('/', asyncHandler(ctrl.generate));

export default r;
