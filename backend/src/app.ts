import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { corsOptions } from './config/cors.js';
import rateLimiter from './config/rateLimit.js';

const app = express();
app.get('/health', (_req: Request, res: Response) => res.send('ok'));

app.use(rateLimiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api', router);

// Fallback 404
app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Not found' });
});

// Error handler (last)
app.use(errorHandler);

export default app;
