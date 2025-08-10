import { Schema, model, Types } from 'mongoose';

const attemptSchema = new Schema({
  questionId: { type: Types.ObjectId, ref: 'Question', required: true },
  selectedKey: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const examSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  step: { type: Number, enum: [1,2,3], required: true },
  levels: [{ type: String, enum: ['A1','A2','B1','B2','C1','C2'], required: true }],
  status: { type: String, enum: ['CREATED','IN_PROGRESS','SUBMITTED','AUTO_SUBMITTED','EXPIRED'], default: 'CREATED' },
  startedAt: Date,
  expiresAt: Date,
  submittedAt: Date,
  questions: [{ type: Types.ObjectId, ref: 'Question', required: true }],
  attempts: [attemptSchema],
  scorePercent: Number,
  awardedLevel: { type: String, enum: ['A1','A2','B1','B2','C1','C2', null], default: null },
  nextStepUnlocked: { type: Boolean, default: false }
}, { timestamps: true });

examSchema.index({ userId: 1, step: 1, status: 1 });

export const Exam = model('Exam', examSchema);
