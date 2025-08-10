import { Exam } from './exam.model.js';
import { Question } from '../questions/question.model.js';
import { env } from '../../config/env.js';
import { scorePercent } from './exam.scoring.js';
import { applyStepPolicy } from './exam.policy.js';
import { User } from '../users/user.model.js';
import { Competency } from '../competencies/competency.model.js';
import { Policy } from '../settings/policy.model.js';

const LEVELS_BY_STEP: Record<number, string[]> = {
  1: ['A1', 'A2'],
  2: ['B1', 'B2'],
  3: ['C1', 'C2']
};
async function getActiveCompetencies(limit: number): Promise<string[]> {
  const rows = await Competency.find({ active: true }).sort({ name: 1 }).limit(limit).lean();
  if (rows.length > 0) return rows.map(r => r.name);
  // fallback if none configured
  return ['Computer Basics', 'Operating Systems'];
}

export async function startExam(userId: string, step: 1 | 2 | 3) {
  if (step === 1) {
    const user = await User.findById(userId).lean();
    if (user?.step1LockedAt) throw Object.assign(new Error('Step 1 retake not allowed'), { status: 403 });
  }
  // Prevent retake if this step is already completed
  const completed = await Exam.findOne({ userId, step, status: { $in: ['SUBMITTED', 'AUTO_SUBMITTED'] } }).lean();
  if (completed) throw Object.assign(new Error('Step already completed'), { status: 400 });
  const levels = LEVELS_BY_STEP[step];
  // Select 4 total (2 per level) from first N active competencies
  const perLevel = 2;
  const comps = await getActiveCompetencies(perLevel);
  const picked: any[] = [];
  for (const lv of levels) {
    for (const comp of comps) {
      const q = await Question.findOne({ active: true, level: lv, competency: comp }).sort({ _id: 1 }).lean();
      if (q) picked.push(q);
    }
  }
  // Fallback: if not enough, sample remaining
  if (picked.length < 4) {
    const remain = 4 - picked.length;
    const more = await Question.aggregate([
      { $match: { active: true, level: { $in: levels }, _id: { $nin: picked.map(p => p._id) } } },
      { $sample: { size: remain } }
    ]);
    picked.push(...more);
  }

  const perQ = env.PER_QUESTION_SECONDS;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + (picked.length * perQ * 1000));

  const exam = await Exam.create({
    userId, step, levels, status: 'IN_PROGRESS',
    startedAt, expiresAt, questions: picked.map((q: any) => q._id)
  });

  return exam;
}

export async function planExam(_userId: string, step: 1 | 2 | 3) {
  const levels = LEVELS_BY_STEP[step];
  const totalEligible = await Question.countDocuments({ active: true, level: { $in: levels } });
  const perQ = env.PER_QUESTION_SECONDS;
  // Selection logic aims for 4 questions total if available
  const questionCount = Math.min(4, totalEligible);
  // Fetch policy unlock thresholds
  let unlockNextAt: number | null = null;
  let prevUnlockAt: number | null = null;
  try {
    const cfg = await Policy.findOne().lean();
    if (cfg) {
      const currentKey = (`step${step}`) as 'step1' | 'step2' | 'step3';
      const current = (cfg as any)[currentKey];
      if (current && typeof current.unlockNextAt === 'number') unlockNextAt = current.unlockNextAt;
      if (step > 1) {
        const prevKey = (`step${(step as number) - 1}`) as 'step1' | 'step2';
        const prev = (cfg as any)[prevKey];
        if (prev && typeof prev.unlockNextAt === 'number') prevUnlockAt = prev.unlockNextAt;
      }
    }
  } catch { /* ignore */ }
  return { questionCount, secondsPerQuestion: perQ, unlockNextAt, prevUnlockAt } as any;
}

export async function answer(examId: string, userId: string, questionId: string, selectedKey: string) {
  const exam = await Exam.findById(examId);
  if (!exam || !exam.userId || exam.userId.toString() !== userId) throw Object.assign(new Error('Not found'), { status: 404 });
  const now = new Date();
  if (exam.expiresAt && now > exam.expiresAt) {
    exam.status = 'EXPIRED';
    await exam.save();
    throw Object.assign(new Error('Exam expired'), { status: 400 });
  }
  if (exam.status !== 'IN_PROGRESS') throw Object.assign(new Error('Exam not in progress'), { status: 400 });

  const question = await Question.findById(questionId);
  if (!question) throw Object.assign(new Error('Question not found'), { status: 404 });
  const isCorrect = question.correctKey === selectedKey;

  // upsert attempt
  const idx = exam.attempts.findIndex(a => a.questionId.toString() === questionId);
  if (idx >= 0) {
    exam.attempts[idx].selectedKey = selectedKey;
    exam.attempts[idx].isCorrect = isCorrect;
  } else {
    exam.attempts.push({ questionId: question._id, selectedKey, isCorrect } as any);
  }
  await exam.save();
  return { ok: true };
}

export async function submit(examId: string, userId: string) {
  const exam = await Exam.findById(examId);
  if (!exam || !exam.userId || exam.userId.toString() != userId) throw Object.assign(new Error('Not found'), { status: 404 });
  if (exam.status !== 'IN_PROGRESS') throw Object.assign(new Error('Already submitted'), { status: 400 });

  const total = exam.questions.length;
  const score = scorePercent((exam.attempts as any[]).map(a => ({ isCorrect: (a as any).isCorrect })), total);
  // Prefer dynamic policy if configured; fallback to code policy
  let policy: any;
  const cfg = await Policy.findOne().lean();
  if (cfg) {
    const key = (`step${exam.step}`) as 'step1' | 'step2' | 'step3';
    const section: any = (cfg as any)[key] || { thresholds: [] };
    const thresholds = Array.isArray(section.thresholds) ? section.thresholds : [];
    const unlockNextAt = typeof section.unlockNextAt === 'number' ? section.unlockNextAt : 75;
    // find the highest threshold <= score
    let award = null as any;
    for (const t of thresholds.sort((a: any, b: any) => (a.min ?? 0) - (b.min ?? 0))) {
      if (score >= (t.min ?? 0)) award = t.award ?? null;
    }
    const stepNum = Number((exam as any).step);
    policy = { awarded: award, next: stepNum < 3 ? score >= unlockNextAt : false, lockStep1: stepNum === 1 && section.lockStep1Below != null ? score < section.lockStep1Below : false };
  } else {
    policy = applyStepPolicy(exam.step as 1 | 2 | 3, score);
  }

  exam.status = 'SUBMITTED';
  exam.submittedAt = new Date();
  exam.scorePercent = score;
  exam.awardedLevel = policy.awarded ?? exam.awardedLevel;
  exam.nextStepUnlocked = !!policy.next;
  await exam.save();

  if (exam.step === 1 && policy.lockStep1) {
    await User.findByIdAndUpdate(userId, { step1LockedAt: new Date() });
  }

  return exam;
}

export async function getExam(examId: string, userId: string) {
  const exam = await Exam.findById(examId).lean();
  if (!exam || !(exam as any).userId || (exam as any).userId.toString() !== userId) throw Object.assign(new Error('Not found'), { status: 404 });
  const exp = (exam as any).expiresAt as any;
  const timeLeft = exp ? Math.max(0, Math.floor((new Date(exp as any).getTime() - Date.now()) / 1000)) : null;
  return { ...exam, timeLeft };
}

export async function myExams(userId: string) {
  return Exam.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function studentProgress(userId: string) {
  const rows = await Exam.find({ userId }).select('step status scorePercent awardedLevel submittedAt createdAt').sort({ createdAt: -1 }).lean();
  const pickSubmitted = (step: 1 | 2 | 3) => rows.find((e: any) => e.step === step && (e.status === 'SUBMITTED' || e.status === 'AUTO_SUBMITTED')) as any;
  const summarize = (step: 1 | 2 | 3) => {
    const ex = pickSubmitted(step);
    if (!ex) return { attempted: false, percent: null, awardedLevel: null, submittedAt: null } as any;
    return {
      attempted: true,
      percent: typeof (ex as any).scorePercent === 'number' ? (ex as any).scorePercent : null,
      awardedLevel: (ex as any).awardedLevel ?? null,
      submittedAt: (ex as any).submittedAt ?? null,
    } as any;
  };
  return { step1: summarize(1), step2: summarize(2), step3: summarize(3) } as any;
}

export async function resetExam(examId: string) {
  const exam = await Exam.findById(examId).lean();
  if (!exam) throw Object.assign(new Error('Not found'), { status: 404 });
  if (exam.status === 'IN_PROGRESS') throw Object.assign(new Error('Cannot reset in-progress exam'), { status: 400 });
  const userId = (exam as any).userId;
  // If resetting a Step 1 exam, also clear any Step 1 lock to allow retake
  if ((exam as any).step === 1 && userId) {
    await User.updateOne({ _id: userId }, { $unset: { step1LockedAt: 1 } });
  }
  // Delete only the selected exam
  await Exam.deleteOne({ _id: examId });
  return { ok: true, clearedAll: false, deleted: 1, step: (exam as any).step } as any;
}
