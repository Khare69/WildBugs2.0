import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { generalLimiter, authLimiter, uploadLimiter } from '../../../src/middleware/rateLimiter';

describe('Rate Limiter Middleware Unit Tests', () => {
  test('exports valid Express request handlers for all tiers', () => {
    assert.equal(typeof generalLimiter, 'function');
    assert.equal(typeof authLimiter, 'function');
    assert.equal(typeof uploadLimiter, 'function');
  });

  test('executes without error for mock request/response', async () => {
    const req = {
      ip: '127.0.0.1',
      headers: {},
      app: { get: () => false },
      method: 'GET',
      path: '/api/species',
    } as any;

    const res = {
      setHeader: () => {},
      getHeader: () => undefined,
      status: () => res,
      json: () => res,
    } as any;

    await new Promise<void>((resolve, reject) => {
      generalLimiter(req, res, (err?: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
});
