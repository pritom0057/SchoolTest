import { Request, Response, NextFunction } from 'express';

export default function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ ok: false, error: 'Forbidden' });
    next();
  };
}
