import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { AuthUserPayload } from '../types/express';

/**
 * Middleware factory that enforces role-based access control (RBAC).
 * Requires the authenticate middleware to run first so req.user is populated.
 *
 * @param allowedRoles List of roles permitted to access the endpoint
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required: User not logged in');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Forbidden: Role '${req.user.role}' is not authorized to perform this action`
      );
    }

    next();
  };
};

export default authorize;
