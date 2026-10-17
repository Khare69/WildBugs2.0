import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import app from '../../../src/app';

describe('Global Error Handling Integration Tests', () => {
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

  it('Catch-all 404 returns structured JSON error envelope for undefined routes', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-endpoint-xyz`);
    assert.equal(res.status, 404);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Cannot GET \/api\/unknown-endpoint-xyz/);
  });

  it('Malformed JSON body returns 400 Bad Request with JSON error envelope', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email": "broken-json-no-closing-brace',
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Invalid JSON format/i);
  });
});
