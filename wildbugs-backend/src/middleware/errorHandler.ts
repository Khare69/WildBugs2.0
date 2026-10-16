import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import env from '../config/env';

/**
 * Higher-order utility wrapping async Express route handlers to eliminate try/catch boilerplate.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Centralized global Express error handler middleware.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev = env.NODE_ENV === 'development';

  // 1. Handle Known Operational Application Errors (AppError subclasses)
  if (err instanceof AppError) {
    if (!err.isOperational) {
      console.error(`[CRITICAL] Non-operational AppError on ${req.method} ${req.url}:`, err);
    }
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
      ...(isDev && err.stack ? { stack: err.stack } : {}),
    });
    return;
  }

  // 2. Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      status: 'fail',
      message: 'Request payload validation failed',
      error: 'Validation error',
      details: formatted,
    });
    return;
  }

  // 3. Handle Unexpected System / Runtime Errors (Status 500)
  const errorObj = err instanceof Error ? err : new Error(String(err));
  console.error(`[ERROR] Unhandled Exception on ${req.method} ${req.url}:`, errorObj);

  res.status(500).json({
    status: 'error',
    message: isDev ? errorObj.message : 'Internal server error',
    error: 'Internal server error',
    ...(isDev && errorObj.stack ? { stack: errorObj.stack } : {}),
  });
};

export default errorHandler;
