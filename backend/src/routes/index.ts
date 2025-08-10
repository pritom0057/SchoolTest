import { Router } from 'express';
import auth from '../modules/auth/auth.routes.js';
import users from '../modules/users/user.routes.js';
import questions from '../modules/questions/question.routes.js';
import seed from '../modules/seed/seed.routes.js';
import exams from '../modules/exams/exam.routes.js';
import certificates from '../modules/certificates/certificate.routes.js';
import competencies from '../modules/competencies/competency.routes.js';
import policy from '../modules/settings/policy.routes.js';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/questions', questions);
router.use('/seed', seed);
router.use('/exams', exams);
router.use('/certificates', certificates);
router.use('/competencies', competencies);
router.use('/policy', policy);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

export default router;
