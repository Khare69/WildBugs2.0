import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../../src/app';
import authService from '../../../src/services/authService';
import { Role } from '@prisma/client';

describe('Notifications Routes Integration Tests', () => {
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
      id: 'test-user-uuid-notifications',
      email: 'alerts@wildbugs.org',
      role: Role.USER,
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/notifications rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`);
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Authentication required/i);
  });

  it('GET /api/notifications/unread-count rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/unread-count`);
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });

  it('POST /api/notifications/mark-all-read rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/mark-all-read`, {
      method: 'POST',
    });
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });

  it('PATCH /api/notifications/:id/read rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/sample-id-1/read`, {
      method: 'PATCH',
    });
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });

  it('GET /api/notifications authorizes authenticated caller and reaches service layer', async () => {
    const res = await fetch(`${baseUrl}/api/notifications?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    assert.ok(
      [200, 503].includes(res.status),
      `Expected 200 (success) or 503 (offline DB), got ${res.status}`
    );

    if (res.status === 200) {
      const body: any = await res.json();
      assert.equal(body.status, 'success');
      assert.ok(Array.isArray(body.data.notifications));
      assert.equal(typeof body.data.unreadCount, 'number');
    }
  });

  it('GET /api/notifications/unread-count authorizes authenticated caller and reaches service layer', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    assert.ok(
      [200, 503].includes(res.status),
      `Expected 200 (success) or 503 (offline DB), got ${res.status}`
    );

    if (res.status === 200) {
      const body: any = await res.json();
      assert.equal(body.status, 'success');
      assert.equal(typeof body.data.count, 'number');
    }
  });
});
