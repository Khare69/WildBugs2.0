import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { NotFoundError } from './utils/errors';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import speciesRoutes from './routes/speciesRoutes';

import env from './config/env';

const app: Express = express();

// Middleware Stack
const corsOrigins =
  env.CORS_ORIGIN === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Base Health Check Route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'wildbugs-api',
  });
});

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/species', speciesRoutes);

// 404 Catch-All Handler for Undefined Routes
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;
