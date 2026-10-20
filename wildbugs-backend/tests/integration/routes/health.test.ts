import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import app from '../../../src/app';

describe('Health Route Integration Tests', () => {
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

  it('GET /api/health probes db and redis connectivity and returns structured health envelope', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.ok(response.status === 200 || response.status === 503, `Unexpected status: ${response.status}`);

    const body = (await response.json()) as {
      status: string;
      db: boolean;
      redis: boolean;
      service: string;
      timestamp: string;
    };
    assert.ok(typeof body.db === 'boolean', 'db status should be a boolean');
    assert.ok(typeof body.redis === 'boolean', 'redis status should be a boolean');
    if (body.db && body.redis) {
      assert.equal(body.status, 'healthy');
      assert.equal(response.status, 200);
    } else {
      assert.equal(body.status, 'degraded');
      assert.equal(response.status, 503);
    }
    assert.equal(body.service, 'wildbugs-api');
    assert.ok(body.timestamp, 'Timestamp should be present');
  });
});
