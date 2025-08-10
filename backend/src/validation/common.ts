import { z } from 'zod';

export const idParam = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid ObjectId'),
  }),
});
