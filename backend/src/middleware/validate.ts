import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export default function validate(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      return res.status(400).json({ ok: false, error: result.error.flatten() });
    }
    next();
  };
}
