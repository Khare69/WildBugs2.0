import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
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

  // 2. Handle Multer File Upload Errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        status: 'fail',
        message: 'File size exceeds maximum upload limit of 10MB',
        error: 'Payload Too Large',
      });
      return;
    }
    res.status(400).json({
      status: 'fail',
      message: err.message,
      error: 'File upload error',
    });
    return;
  }

  // 3. Handle Body Parser JSON Syntax Errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid JSON format in request payload',
      error: 'Malformed JSON payload',
    });
    return;
  }

  // 3. Handle Zod Schema Validation Errors
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

  // 4. Handle Prisma Database Client Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(', ')
        : 'field';
      res.status(409).json({
        status: 'fail',
        message: `A record with this ${target} already exists`,
        error: 'Unique constraint conflict',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'fail',
        message: 'The requested record was not found in the database',
        error: 'Record not found',
      });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error(`[DATABASE CONNECTION ERROR] Could not connect to PostgreSQL:`, err.message);
    res.status(503).json({
      status: 'error',
      message: 'Database service is temporarily unavailable. Please verify database connectivity.',
      error: 'Service unavailable',
    });
    return;
  }

  // 5. Handle Unexpected System / Runtime Errors (Status 500)
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
