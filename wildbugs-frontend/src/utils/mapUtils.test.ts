import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMarkerBadgeColor,
  geoJsonToLeafletLatLng,
  formatObservationDate,
} from './mapUtils.ts';

describe('Map Utilities Unit Tests', () => {
  describe('getMarkerBadgeColor', () => {
    it('returns emerald green for VERIFIED status', () => {
      assert.equal(getMarkerBadgeColor('VERIFIED'), '#10b981');
    });

    it('returns cyan for IDENTIFIED status', () => {
      assert.equal(getMarkerBadgeColor('IDENTIFIED'), '#06b6d4');
    });

    it('returns red for REJECTED status', () => {
      assert.equal(getMarkerBadgeColor('REJECTED'), '#ef4444');
    });

    it('returns amber for PENDING or unknown status', () => {
      assert.equal(getMarkerBadgeColor('PENDING'), '#f59e0b');
      assert.equal(getMarkerBadgeColor('UNKNOWN'), '#f59e0b');
    });
  });

  describe('geoJsonToLeafletLatLng', () => {
    it('inverts RFC 7946 GeoJSON [lng, lat] to Leaflet [lat, lng]', () => {
      const geoJsonCoords: [number, number] = [77.2090, 28.6139]; // [lng, lat]
      const leafletLatLng = geoJsonToLeafletLatLng(geoJsonCoords);

      assert.deepEqual(leafletLatLng, [28.6139, 77.2090]); // [lat, lng]
    });
  });

  describe('formatObservationDate', () => {
    it('formats ISO date string into readable format', () => {
      const formatted = formatObservationDate('2026-04-15T10:30:00.000Z');
      assert.match(formatted, /Apr 15, 2026/);
    });

    it('returns fallback string for invalid date strings', () => {
      const result = formatObservationDate('not-a-valid-date');
      assert.equal(result, 'not-a-valid-date');
    });
  });
});
