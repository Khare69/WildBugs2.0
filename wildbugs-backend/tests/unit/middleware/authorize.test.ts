import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authorize } from '../../../src/middleware/authorize';
import { ForbiddenError, UnauthorizedError } from '../../../src/utils/errors';

describe('Authorize Middleware Unit Tests', () => {
  it('throws UnauthorizedError when req.user is undefined', () => {
    const middleware = authorize(Role.EXPERT, Role.ADMIN);
    const req = {} as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    assert.throws(
      () => middleware(req, res, next),
      (err: any) => err instanceof UnauthorizedError
    );
    assert.equal(nextCalled, false);
  });

  it('throws ForbiddenError when user has regular USER role and EXPERT is required', () => {
    const middleware = authorize(Role.EXPERT, Role.ADMIN);
    const req = {
      user: {
        userId: 'regular-user-id',
        email: 'user@wildbugs.org',
        role: Role.USER,
      },
    } as unknown as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    assert.throws(
      () => middleware(req, res, next),
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.match(err.message, /not authorized/i);
        return true;
      }
    );
    assert.equal(nextCalled, false);
  });

  it('calls next() successfully when user has EXPERT role', () => {
    const middleware = authorize(Role.EXPERT, Role.ADMIN);
    const req = {
      user: {
        userId: 'expert-user-id',
        email: 'expert@wildbugs.org',
        role: Role.EXPERT,
      },
    } as unknown as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
  });

  it('calls next() successfully when user has ADMIN role', () => {
    const middleware = authorize(Role.EXPERT, Role.ADMIN);
    const req = {
      user: {
        userId: 'admin-user-id',
        email: 'admin@wildbugs.org',
        role: Role.ADMIN,
      },
    } as unknown as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
  });
});
