import { Request, Response, NextFunction } from 'express';

// Placeholder: verify Safe Exam Browser headers/signature here
export default function sebGuard(_req: Request, _res: Response, next: NextFunction) {
  // Implement real checks (e.g., SEB config key, user agent, signed tokens)
  next();
}
