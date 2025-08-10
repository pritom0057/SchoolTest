import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import validate from '../../middleware/validate.js';
import { registerSchema, verifyOtpSchema, loginSchema, refreshSchema, forgotSchema, resetSchema } from '../../validation/auth.schema.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const r = Router();

r.post('/register', validate(registerSchema), asyncHandler(ctrl.register));
r.post('/verify-otp', validate(verifyOtpSchema), asyncHandler(ctrl.verifyOtp));
r.post('/login', validate(loginSchema), asyncHandler(ctrl.login));
r.post('/refresh', validate(refreshSchema), asyncHandler(ctrl.refresh));
// Stubs
r.post('/forgot-password', validate(forgotSchema), asyncHandler(async (_req, res) => res.json({ ok: true })));
r.post('/reset-password', validate(resetSchema), asyncHandler(async (_req, res) => res.json({ ok: true })));
r.post('/logout', asyncHandler(ctrl.logout));

export default r;
