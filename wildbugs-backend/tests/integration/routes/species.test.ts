import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import app from '../../../src/app';

describe('Species Routes Integration Tests', () => {
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

  it('GET /api/species/abc returns 400 for non-integer species ID', async () => {
    const res = await fetch(`${baseUrl}/api/species/abc`);
    assert.equal(res.status, 400);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.details.some((d: any) => d.field === 'id'));
  });

  it('GET /api/species/0 returns 400 for non-positive ID', async () => {
    const res = await fetch(`${baseUrl}/api/species/0`);
    assert.equal(res.status, 400);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.details.some((d: any) => d.field === 'id'));
  });

  it('GET /api/species/-10 returns 400 for negative ID', async () => {
    const res = await fetch(`${baseUrl}/api/species/-10`);
    assert.equal(res.status, 400);

    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });

  it('GET /api/species/families is not intercepted by /:id param route', async () => {
    // When hit, it should attempt to execute getFamiliesHandler (not fail with 'Species ID must be a positive integer')
    const res = await fetch(`${baseUrl}/api/species/families`);
    // Even if database connection is mocked or unavailable, status must NOT be 400 validation error on id
    assert.notEqual(res.status, 400);
  });
});
