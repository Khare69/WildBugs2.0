import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../../src/app';
import authService from '../../../src/services/authService';
import { Role } from '@prisma/client';

describe('Sightings Routes Integration Tests', () => {
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
      email: 'observer@wildbugs.org',
      role: Role.USER,
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('POST /api/sightings returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${baseUrl}/api/sightings`, {
      method: 'POST',
    });

    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Authentication required/i);
  });

  it('POST /api/sightings returns 400 when photo file is missing', async () => {
    const formData = new FormData();
    formData.append('latitude', '28.6139');
    formData.append('longitude', '77.2090');

    const res = await fetch(`${baseUrl}/api/sightings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /photo file is required/i);
  });

  it('POST /api/sightings returns 400 when latitude is out of bounds', async () => {
    const formData = new FormData();
    const dummyBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
    formData.append('photo', dummyBlob, 'bug.jpg');
    formData.append('latitude', '125.0'); // Invalid latitude > 90
    formData.append('longitude', '77.2090');

    const res = await fetch(`${baseUrl}/api/sightings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });

  it('POST /api/sightings returns 400 when longitude is out of bounds', async () => {
    const formData = new FormData();
    const dummyBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
    formData.append('photo', dummyBlob, 'bug.jpg');
    formData.append('latitude', '28.6139');
    formData.append('longitude', '250.0'); // Invalid longitude > 180

    const res = await fetch(`${baseUrl}/api/sightings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });

  it('POST /api/sightings returns 400 when non-image file type is uploaded', async () => {
    const formData = new FormData();
    const textBlob = new Blob(['this is text, not an image'], { type: 'text/plain' });
    formData.append('photo', textBlob, 'notes.txt');
    formData.append('latitude', '28.6139');
    formData.append('longitude', '77.2090');

    const res = await fetch(`${baseUrl}/api/sightings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
      body: formData,
    });

    assert.equal(res.status, 400);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
    assert.match(body.message, /Invalid file type/i);
  });

  it('GET /api/sightings/me returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${baseUrl}/api/sightings/me`);
    assert.equal(res.status, 401);
    const body: any = await res.json();
    assert.equal(body.status, 'fail');
  });
});
