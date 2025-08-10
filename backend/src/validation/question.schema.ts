import { z } from 'zod';

export const levelEnum = z.enum(['A1','A2','B1','B2','C1','C2']);

export const createQuestionSchema = z.object({
  body: z.object({
    competency: z.string().min(1),
    level: levelEnum,
    text: z.string().min(1),
    options: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).min(2),
    correctKey: z.string().min(1),
    tags: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  }),
});

export const updateQuestionSchema = z.object({
  body: z.object({
    competency: z.string().min(1).optional(),
    level: levelEnum.optional(),
    text: z.string().min(1).optional(),
    options: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).min(2).optional(),
    correctKey: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  }),
});
