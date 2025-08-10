import { z } from 'zod';
import { levelEnum } from './question.schema.js';

export const startExamSchema = z.object({
  params: z.object({
    step: z.coerce.number().min(1).max(3),
  }),
});

export const answerSchema = z.object({
  body: z.object({
    questionId: z.string().length(24),
    selectedKey: z.string().min(1),
  }),
});

export const submitSchema = z.object({
  body: z.object({}).optional(),
});

export const levelsByStep = {
  1: ['A1','A2'],
  2: ['B1','B2'],
  3: ['C1','C2'],
} as const;
