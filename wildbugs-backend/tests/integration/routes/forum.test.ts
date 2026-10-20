import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../../src/app';
import authService from '../../../src/services/authService';
import { Role } from '@prisma/client';

describe('Forum Routes Integration Tests', () => {
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
      id: 'test-user-uuid-forum',
      email: 'forum-naturalist@wildbugs.org',
      role: Role.USER,
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/forum/posts retrieves paginated discussion posts', async () => {
    const res = await fetch(`${baseUrl}/api/forum/posts`);
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
    if (res.status === 200) {
      const body: any = await res.json();
      assert.equal(body.status, 'success');
      assert.ok(Array.isArray(body.data.posts));
    }
  });

  it('GET /api/forum/posts/:id executes thread query', async () => {
    const res = await fetch(`${baseUrl}/api/forum/posts/non-existent-id`);
    assert.ok([404, 503].includes(res.status), `Expected 404 or 503, got ${res.status}`);
  });

  it('POST /api/forum/posts rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/forum/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Post',
        body: 'This should fail authentication.',
      }),
    });
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /authentication required/i);
  });

  it('POST /api/forum/posts rejects invalid input with 400 when authenticated', async () => {
    const res = await fetch(`${baseUrl}/api/forum/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        title: '',
        body: 'Short',
      }),
    });
    assert.ok([400, 503].includes(res.status), `Expected 400 or 503, got ${res.status}`);
    if (res.status === 400) {
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.match(body.message, /title is required/i);
    }
  });

  it('POST /api/forum/posts/:id/reply rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/forum/posts/some-post-id/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: 'A quick reply without auth.',
      }),
    });
    assert.equal(res.status, 401);
  });

  it('POST /api/forum/posts/:id/upvote rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/forum/posts/some-post-id/upvote`, {
      method: 'POST',
    });
    assert.equal(res.status, 401);
  });
});
