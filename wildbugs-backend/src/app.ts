import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { NotFoundError } from './utils/errors';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import speciesRoutes from './routes/speciesRoutes';
import sightingRoutes from './routes/sightingRoutes';
import mapRoutes from './routes/mapRoutes';
import userRoutes from './routes/userRoutes';
import challengeRoutes from './routes/challengeRoutes';
import forumRoutes from './routes/forumRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { generalLimiter } from './middleware/rateLimiter';
import prisma from './database/prisma';
import { redisConnection } from './database/redis';

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

// Deep Health Check Route (probes Database & Redis connectivity)
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbHealthy = false;
  let redisHealthy = false;

  // 1. Probe database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  // 2. Probe Redis connection
  try {
    if (redisConnection && redisConnection.status === 'ready') {
      await redisConnection.ping();
      redisHealthy = true;
    }
  } catch {
    redisHealthy = false;
  }

  const isHealthy = dbHealthy && redisHealthy;
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'degraded',
    db: dbHealthy,
    redis: redisHealthy,
    service: 'wildbugs-api',
    timestamp: new Date().toISOString(),
  });
});

// Apply General Rate Limiter to all API routes (100 req/min/IP)
app.use('/api', generalLimiter);

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/sightings', sightingRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Catch-All Handler for Undefined Routes
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;
