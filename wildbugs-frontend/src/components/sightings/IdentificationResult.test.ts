import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Sighting } from '../../types/sighting.ts';

describe('Identification Result Logic Unit Tests', () => {
  const sampleSighting: Sighting = {
    id: 'sighting-uuid-1234',
    userId: 'user-naturalist-1',
    speciesId: 10,
    photoUrl: 'https://cloudinary.com/wildbugs/photo.jpg',
    thumbnailUrl: 'https://cloudinary.com/wildbugs/photo_thumb.jpg',
    latitude: 28.5147,
    longitude: 77.2625,
    aiConfidence: 0.92,
    status: 'IDENTIFIED',
    observedAt: '2026-10-17T12:00:00Z',
    createdAt: '2026-10-17T12:05:00Z',
    species: {
      id: 10,
      commonName: 'Indian Praying Mantis',
      scientificName: 'Mantis religiosa',
      family: 'Mantidae',
      description: 'Remarkable predatory insect with raptorial forelegs.',
      habitat: 'Shrubbery, grasslands, and home gardens',
      diet: 'Carnivorous (flies, crickets, spiders)',
      lifecycle: 'Hemimetabolous with egg ootheca, nymphs, and winged adults',
      imageUrl: 'https://cloudinary.com/wildbugs/species_10.jpg',
      conservationStatus: 'Least Concern',
      createdAt: '2026-10-16T00:00:00Z',
    },
    identifications: [
      {
        id: 'id-uuid-1',
        sightingId: 'sighting-uuid-1234',
        userId: 'system-ai',
        speciesId: 10,
        source: 'AI',
        confidence: 0.92,
        isAccepted: true,
        createdAt: '2026-10-17T12:05:05Z',
      },
    ],
  };

  it('correctly maps confidence percentage and tier level', () => {
    const confidence = sampleSighting.aiConfidence ?? 0;
    const confidencePercent = Math.round(confidence * 100);
    assert.equal(confidencePercent, 92);

    const getConfidenceTier = (score: number) => {
      if (score >= 0.85) return 'high';
      if (score >= 0.6) return 'medium';
      return 'low';
    };

    assert.equal(getConfidenceTier(0.92), 'high');
    assert.equal(getConfidenceTier(0.72), 'medium');
    assert.equal(getConfidenceTier(0.35), 'low');
  });

  it('evaluates status flags accurately', () => {
    assert.equal(sampleSighting.status, 'IDENTIFIED');
    assert.equal(sampleSighting.identifications?.length, 1);
    assert.equal(sampleSighting.identifications?.[0].source, 'AI');
    assert.equal(sampleSighting.identifications?.[0].isAccepted, true);
  });

  it('formats geographic coordinates for OpenStreetMap link', () => {
    const lat = sampleSighting.latitude;
    const lng = sampleSighting.longitude;
    const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    assert.equal(
      osmLink,
      'https://www.openstreetmap.org/?mlat=28.5147&mlon=77.2625#map=16/28.5147/77.2625'
    );
  });
});
