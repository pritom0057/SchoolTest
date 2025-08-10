import { Request, Response } from 'express';
import * as svc from './exam.service.js';
import { Exam } from './exam.model.js';

export async function start(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const step = Number(req.params.step) as 1 | 2 | 3;
  const exam = await svc.startExam(userId, step);
  const populated = await Exam.findById(exam._id)
    .populate({ path: 'questions', select: 'competency level text options' })
    .populate({ path: 'attempts.questionId', select: 'competency level text options' })
    .lean();
  res.status(201).json({ ok: true, data: populated });
}

export async function answer(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const examId = req.params.id;
  const { questionId, selectedKey } = req.body;
  const r = await svc.answer(examId, userId, questionId, selectedKey);
  res.json(r);
}

export async function submit(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const examId = req.params.id;
  const exam = await svc.submit(examId, userId);
  const populated = await Exam.findById(exam._id)
    .populate({ path: 'questions', select: 'competency level text options' })
    .populate({ path: 'attempts.questionId', select: 'competency level text options' })
    .lean();
  const total = populated?.questions?.length ?? 0;
  const correct = Array.isArray(populated?.attempts) ? populated!.attempts.filter((a: any) => a.isCorrect).length : 0;
  const percent = total ? (correct / total) * 100 : 0;
  res.json({ ok: true, data: populated, summary: { total, correct, percent, awardedLevel: (exam as any).awardedLevel, nextStepUnlocked: (exam as any).nextStepUnlocked } });
}

export async function getOne(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const examId = req.params.id;
  const data = await svc.getExam(examId, userId);
  const populated = await Exam.findById(examId)
    .populate({ path: 'questions', select: 'competency level text options' })
    .populate({ path: 'attempts.questionId', select: 'competency level text options' })
    .lean();
  res.json({ ok: true, data: { ...populated, timeLeft: (data as any).timeLeft } });
}

export async function listMine(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const data = await svc.myExams(userId);
  res.json({ ok: true, data });
}

export async function listAll(_req: Request, res: Response) {
  const rows = await Exam.find()
    .populate({ path: 'userId', select: 'name email role' })
    .lean();
  const data = rows.map((e: any) => {
    const total = Array.isArray(e.questions) ? e.questions.length : 0;
    const correct = Array.isArray(e.attempts) ? e.attempts.filter((a: any) => a.isCorrect).length : 0;
    const percent = total ? (correct / total) * 100 : 0;
    return {
      _id: e._id,
      userId: e.userId, // populated object
      step: e.step,
      status: e.status,
      total,
      correct,
      percent,
      awardedLevel: e.awardedLevel ?? null,
      updatedAt: e.updatedAt,
      createdAt: e.createdAt,
    };
  });
  res.json({ ok: true, data });
}

export async function reset(req: Request, res: Response) {
  const id = req.params.id;
  const r = await svc.resetExam(id);
  res.json(r);
}

export async function plan(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const step = Number(req.params.step) as 1 | 2 | 3;
  const r = await svc.planExam(userId, step);
  res.json({ ok: true, data: r });
}
