import { Router } from 'express';
import requireAuth from '../../middleware/requireAuth.js';
import requireRole from '../../middleware/requireRole.js';
import * as ctrl from './user.controller.js';

const r = Router();

r.get('/me', requireAuth, ctrl.me);
r.get('/', requireAuth, requireRole('ADMIN', 'SUPERVISOR'), ctrl.listUsers);
r.post('/role', requireAuth, requireRole('ADMIN'), ctrl.updateRole);

export default r;
