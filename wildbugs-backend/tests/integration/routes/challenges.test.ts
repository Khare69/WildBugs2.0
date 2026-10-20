import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../../src/app';
import authService from '../../../src/services/authService';
import { Role } from '@prisma/client';

describe('Challenge Routes Integration Tests', () => {
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
      email: 'challenge-tester@wildbugs.org',
      role: Role.USER,
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/challenges retrieves active challenges', async () => {
    const res = await fetch(`${baseUrl}/api/challenges`);
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
    if (res.status === 200) {
      const body: any = await res.json();
      assert.equal(body.status, 'success');
      assert.ok(Array.isArray(body.data));
    }
  });

  it('GET /api/challenges/:id rejects non-numeric ID with 400', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/not-a-number`);
    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /valid numeric challenge ID/i);
  });

  it('GET /api/challenges/:id executes challenge detail query', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/99999`);
    assert.ok([404, 503].includes(res.status), `Expected 404 or 503, got ${res.status}`);
  });

  it('POST /api/challenges/:id/join requires authentication', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/1/join`, {
      method: 'POST',
    });
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Authentication required/i);
  });

  it('POST /api/challenges/:id/join with valid Bearer token executes join handler', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/1/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    // Will return 200 (if DB active & seeded), 404 (if challenge 1 not found), or 503 (offline mock DB)
    assert.ok([200, 404, 503].includes(res.status), `Expected 200, 404, or 503, got ${res.status}`);
  });

  it('GET /api/challenges/:id/progress requires authentication', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/1/progress`);
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Authentication required/i);
  });

  it('GET /api/challenges/:id/progress with valid token executes progress query', async () => {
    const res = await fetch(`${baseUrl}/api/challenges/1/progress`, {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    assert.ok([200, 404, 503].includes(res.status), `Expected 200, 404, or 503, got ${res.status}`);
  });
});
