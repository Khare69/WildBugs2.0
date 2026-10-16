import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { NotFoundError } from './utils/errors';
import errorHandler from './middleware/errorHandler';

const app: Express = express();

// Middleware Stack
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'wildbugs-api',
  });
});

// 404 Catch-All Handler for Undefined Routes
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;
