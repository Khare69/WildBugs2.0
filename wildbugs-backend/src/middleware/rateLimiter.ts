import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';
import type { AuthUserPayload } from '../types/express';
import env from '../config/env';

/**
 * General platform rate limiter:
 * 100 requests / minute / IP
 */
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.NODE_ENV === 'test' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many requests from this IP. Please slow down and try again in a minute.',
  },
  handler: (req: Request, res: Response, _next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * Authentication rate limiter (login / register):
 * 5 attempts / 15 minutes / IP
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  handler: (req: Request, res: Response, _next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * Sighting photo upload rate limiter:
 * 20 uploads / hour / user (keyed by authenticated userId, falls back to IP)
 */
export const uploadLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'test' ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: Request): string => {
    const user = (req as Request & { user?: AuthUserPayload }).user;
    return user?.id || user?.userId || req.ip || 'anonymous';
  },
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Observation upload rate limit exceeded (maximum 20 uploads per hour). Please try again later.',
  },
  handler: (req: Request, res: Response, _next, options) => {
    res.status(429).json(options.message);
  },
});
