import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      sub: string;
      role: 'ADMIN' | 'STUDENT' | 'SUPERVISOR';
      email: string;
      name?: string;
    };
  }
}
