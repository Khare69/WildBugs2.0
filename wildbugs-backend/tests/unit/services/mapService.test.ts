import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mapService from '../../../src/services/mapService';

describe('MapService Unit Tests', () => {
  describe('aggregateIntoGridCells', () => {
    it('returns empty array when given empty or null points', () => {
      assert.deepEqual(mapService.aggregateIntoGridCells([]), []);
      assert.deepEqual(mapService.aggregateIntoGridCells(null as any), []);
    });

    it('filters out invalid or NaN coordinates', () => {
      const points = [
        { latitude: NaN, longitude: 77.2 },
        { latitude: 28.6, longitude: NaN },
        { latitude: null as any, longitude: 77.2 },
        { latitude: 28.6, longitude: 77.2 },
      ];
      const result = mapService.aggregateIntoGridCells(points, 0.01);
      assert.equal(result.length, 1);
      assert.equal(result[0][0], 28.6);
      assert.equal(result[0][1], 77.2);
      assert.equal(result[0][2], 1);
    });

    it('groups nearby points into the same ~0.01 grid cell and sums intensity', () => {
      // Points very close to each other: 28.611 and 28.614 round to 28.61
      const points = [
        { latitude: 28.611, longitude: 77.209 },
        { latitude: 28.614, longitude: 77.211 },
        { latitude: 28.612, longitude: 77.208 },
      ];
      const result = mapService.aggregateIntoGridCells(points, 0.01);

      assert.equal(result.length, 1);
      const [lat, lng, intensity] = result[0];
      assert.equal(lat, 28.61);
      assert.equal(lng, 77.21);
      assert.equal(intensity, 3);
    });

    it('separates distant points into distinct grid cells', () => {
      const points = [
        { latitude: 28.61, longitude: 77.21 }, // Delhi
        { latitude: 19.07, longitude: 72.87 }, // Mumbai
        { latitude: 12.97, longitude: 77.59 }, // Bangalore
      ];
      const result = mapService.aggregateIntoGridCells(points, 0.01);

      assert.equal(result.length, 3);
      const totalIntensity = result.reduce((sum, p) => sum + p[2], 0);
      assert.equal(totalIntensity, 3);
    });

    it('supports custom gridSize adjustments', () => {
      const points = [
        { latitude: 28.61, longitude: 77.21 },
        { latitude: 28.64, longitude: 77.24 },
      ];
      // With 0.1 deg gridSize, both snap to 28.6, 77.2
      const result = mapService.aggregateIntoGridCells(points, 0.1);
      assert.equal(result.length, 1);
      assert.equal(result[0][2], 2);
    });
  });

  describe('buildWhereClause', () => {
    it('builds latitude and longitude bounds correctly', () => {
      const where = mapService.buildWhereClause({
        minLat: 20,
        maxLat: 30,
        minLng: 70,
        maxLng: 80,
      });

      assert.deepEqual(where.latitude, { gte: 20, lte: 30 });
      assert.deepEqual(where.longitude, { gte: 70, lte: 80 });
    });

    it('handles antimeridian crossing using OR when minLng > maxLng', () => {
      const where = mapService.buildWhereClause({
        minLng: 175,
        maxLng: -175,
      });

      assert.ok(where.OR);
      assert.deepEqual(where.OR, [
        { longitude: { gte: 175 } },
        { longitude: { lte: -175 } },
      ]);
    });

    it('adds speciesId filter when specified', () => {
      const where = mapService.buildWhereClause({
        speciesId: 42,
      });

      assert.equal(where.speciesId, 42);
    });

    it('adds date range filters when specified', () => {
      const fromStr = '2026-01-01T00:00:00.000Z';
      const toStr = '2026-06-30T23:59:59.999Z';
      const where = mapService.buildWhereClause({
        dateFrom: fromStr,
        dateTo: toStr,
      });

      assert.ok(where.observedAt);
      const dateFilter = where.observedAt as any;
      assert.deepEqual(dateFilter.gte, new Date(fromStr));
      assert.deepEqual(dateFilter.lte, new Date(toStr));
    });
  });
});
