import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import app from '../../../src/app';

describe('Auth Routes Integration Tests', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('POST /api/auth/register rejects request with invalid email format', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'ValidPassword123!',
        displayName: 'Observer',
      }),
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(Array.isArray(body.details), 'details should be an array of validation errors');
    assert.ok(body.details.some((d: any) => d.field === 'email'));
  });

  it('POST /api/auth/register rejects short password < 8 characters', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@wildbugs.org',
        password: '123',
        displayName: 'Observer',
      }),
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.details.some((d: any) => d.field === 'password'));
  });

  it('POST /api/auth/register rejects whitespace-only display name', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@wildbugs.org',
        password: 'ValidPassword123!',
        displayName: '   ',
      }),
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.details.some((d: any) => d.field === 'displayName'));
  });

  it('POST /api/auth/login rejects empty password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'observer@wildbugs.org',
        password: '',
      }),
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.details.some((d: any) => d.field === 'password'));
  });

  it('GET /api/auth/me returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Authentication required/i);
  });

  it('GET /api/auth/me returns 401 when Authorization Bearer token is empty', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer ' },
    });
    assert.equal(res.status, 401);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Bearer token is empty/i);
  });

  it('GET /api/auth/me returns 401 when token has invalid signature', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid.jwt.token.string' },
    });
    assert.equal(res.status, 401);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Invalid authentication token/i);
  });
});
