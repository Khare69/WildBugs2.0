import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// Mirroring the schema from sightingController to test the preprocessing logic in isolation
const createSightingSchema = z.object({
  latitude: z.coerce
    .number({ invalid_type_error: 'Latitude must be a valid number' })
    .min(-90, 'Latitude must be between -90 and 90 degrees')
    .max(90, 'Latitude must be between -90 and 90 degrees'),
  longitude: z.coerce
    .number({ invalid_type_error: 'Longitude must be a valid number' })
    .min(-180, 'Longitude must be between -180 and 180 degrees')
    .max(180, 'Longitude must be between -180 and 180 degrees'),
  speciesId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().positive().optional()
  ),
  observedAt: z.string().optional(),
});

describe('SightingController Multipart Validation Schema Unit Tests', () => {
  it('correctly coerces empty string speciesId to undefined without throwing', () => {
    const payload = {
      latitude: '28.6139',
      longitude: '77.2090',
      speciesId: '',
    };

    const parsed = createSightingSchema.parse(payload);
    assert.equal(parsed.latitude, 28.6139);
    assert.equal(parsed.longitude, 77.2090);
    assert.equal(parsed.speciesId, undefined);
  });

  it('correctly parses positive integer speciesId provided as string', () => {
    const payload = {
      latitude: '12.9716',
      longitude: '77.5946',
      speciesId: '42',
    };

    const parsed = createSightingSchema.parse(payload);
    assert.equal(parsed.speciesId, 42);
  });

  it('handles omitted speciesId as undefined', () => {
    const payload = {
      latitude: '19.0760',
      longitude: '72.8777',
    };

    const parsed = createSightingSchema.parse(payload);
    assert.equal(parsed.speciesId, undefined);
  });

  it('rejects invalid latitude out of bounds', () => {
    const payload = {
      latitude: '95.0',
      longitude: '77.2090',
    };

    assert.throws(() => createSightingSchema.parse(payload));
  });

  it('rejects non-positive speciesId', () => {
    const payload = {
      latitude: '28.6139',
      longitude: '77.2090',
      speciesId: '-1',
    };

    assert.throws(() => createSightingSchema.parse(payload));
  });
});
