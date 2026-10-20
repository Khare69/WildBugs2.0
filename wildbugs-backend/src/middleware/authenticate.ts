import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { AuthUserPayload } from '../types/express';

/**
 * Middleware that validates the incoming Bearer JWT token and attaches user identity to req.user.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthorizedError('Authentication required: Bearer token missing');
  }

  const parts = authHeader.trim().split(/\s+/);
  const token = parts[1]?.trim();
  if (!token) {
    throw new UnauthorizedError('Authentication required: Bearer token is empty');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Session expired: Please log in again');
    }
    throw new UnauthorizedError('Invalid authentication token');
  }
};

/**
 * Optional authentication middleware: attaches req.user if a valid Bearer token is provided,
 * but allows unauthenticated visitors to proceed cleanly.
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next();
  }

  const parts = authHeader.trim().split(/\s+/);
  const token = parts[1]?.trim();
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
  } catch {
    // Gracefully ignore expired/invalid tokens for public endpoints
  }
  next();
};

export default authenticate;
