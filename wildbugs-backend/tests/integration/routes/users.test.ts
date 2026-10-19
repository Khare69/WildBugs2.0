import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../../src/app';
import authService from '../../../src/services/authService';
import { Role } from '@prisma/client';

describe('User Routes Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let validToken: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });

    validToken = authService.generateToken({
      id: 'test-user-uuid-1234',
      email: 'naturalist@wildbugs.org',
      role: Role.USER,
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/users/me returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${baseUrl}/api/users/me`);
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Authentication required/i);
  });

  it('GET /api/users/leaderboard is not intercepted by /:id and returns rankings', async () => {
    const res = await fetch(`${baseUrl}/api/users/leaderboard?metric=sightings&limit=5`);
    // Status must NOT be 404 from /:id handler
    assert.notEqual(res.status, 404);
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
    if (res.status === 200) {
      const body: any = await res.json();
      assert.equal(body.status, 'success');
      assert.equal(body.data.metric, 'sightings');
      assert.ok(Array.isArray(body.data.rankings));
    }
  });

  it('GET /api/users/leaderboard rejects invalid metric with 400', async () => {
    const res = await fetch(`${baseUrl}/api/users/leaderboard?metric=invalid_metric`);
    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Invalid metric/i);
  });

  it('GET /api/users/:id/journal executes user journal handler', async () => {
    const res = await fetch(`${baseUrl}/api/users/00000000-0000-0000-0000-000000000000/journal`);
    assert.ok([404, 503].includes(res.status), `Expected 404 or 503, got ${res.status}`);
    if (res.status === 404) {
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.match(body.message, /not found/i);
    }
  });

  it('GET /api/users/:id/badges executes badge query handler', async () => {
    const res = await fetch(`${baseUrl}/api/users/00000000-0000-0000-0000-000000000000/badges`);
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
    if (res.status === 200) {
      const body: any = await res.json();
      assert.equal(body.status, 'success');
      assert.ok(Array.isArray(body.data));
    }
  });

  it('GET /api/users/:id executes public profile handler', async () => {
    const res = await fetch(`${baseUrl}/api/users/00000000-0000-0000-0000-000000000000`);
    assert.ok([404, 503].includes(res.status), `Expected 404 or 503, got ${res.status}`);
    if (res.status === 404) {
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.match(body.message, /not found/i);
    }
  });
});
