import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../../src/app';

describe('Map Routes Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;

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
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('GET /api/map/sightings Validation', () => {
    it('returns 400 when minLat is greater than maxLat', async () => {
      const res = await fetch(`${baseUrl}/api/map/sightings?minLat=40&maxLat=20`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.ok(
        body.details?.some((d: any) =>
          /minLat must be less than or equal to maxLat/i.test(d.message)
        )
      );
    });

    it('returns 400 when minLat is out of range (< -90)', async () => {
      const res = await fetch(`${baseUrl}/api/map/sightings?minLat=-95`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
    });

    it('returns 400 when maxLat is out of range (> 90)', async () => {
      const res = await fetch(`${baseUrl}/api/map/sightings?maxLat=95`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
    });

    it('returns 400 when minLng is out of range (< -180)', async () => {
      const res = await fetch(`${baseUrl}/api/map/sightings?minLng=-185`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
    });

    it('returns 400 when maxLng is out of range (> 180)', async () => {
      const res = await fetch(`${baseUrl}/api/map/sightings?maxLng=185`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
    });

    it('returns 400 when speciesId is non-numeric or negative', async () => {
      const res1 = await fetch(`${baseUrl}/api/map/sightings?speciesId=invalid`);
      assert.equal(res1.status, 400);

      const res2 = await fetch(`${baseUrl}/api/map/sightings?speciesId=-5`);
      assert.equal(res2.status, 400);
    });

    it('returns 400 when dateFrom is an invalid date string', async () => {
      const res = await fetch(`${baseUrl}/api/map/sightings?dateFrom=not-a-date`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
    });

    it('returns 400 when dateFrom is after dateTo', async () => {
      const res = await fetch(
        `${baseUrl}/api/map/sightings?dateFrom=2026-12-31&dateTo=2026-01-01`
      );
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.ok(
        body.details?.some((d: any) =>
          /dateFrom must be before or equal to dateTo/i.test(d.message)
        )
      );
    });
  });

  describe('GET /api/map/heatmap Validation', () => {
    it('returns 400 when minLat is greater than maxLat', async () => {
      const res = await fetch(`${baseUrl}/api/map/heatmap?minLat=50&maxLat=10`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.ok(
        body.details?.some((d: any) =>
          /minLat must be less than or equal to maxLat/i.test(d.message)
        )
      );
    });

    it('returns 400 when gridSize is below minimum (< 0.001)', async () => {
      const res = await fetch(`${baseUrl}/api/map/heatmap?gridSize=0.00001`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.ok(
        body.details?.some((d: any) =>
          /Minimum grid size is 0.001/i.test(d.message)
        )
      );
    });

    it('returns 400 when gridSize is above maximum (> 1.0)', async () => {
      const res = await fetch(`${baseUrl}/api/map/heatmap?gridSize=5.0`);
      assert.equal(res.status, 400);
      const body: any = await res.json();
      assert.equal(body.status, 'fail');
      assert.ok(
        body.details?.some((d: any) =>
          /Maximum grid size is 1.0/i.test(d.message)
        )
      );
    });
  });
});
