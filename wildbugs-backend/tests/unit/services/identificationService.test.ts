import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { identificationService } from '../../../src/services/identificationService';

describe('IdentificationService Unit Tests', () => {
  it('annotates image and generates labels with descriptions and scores', async () => {
    const labels = await identificationService.annotateImage('https://example.com/monarch_butterfly.jpg');

    assert.ok(Array.isArray(labels), 'Expected array of labels');
    assert.ok(labels.length > 0, 'Expected at least one label');
    const hasMonarch = labels.some((l) => l.description.toLowerCase().includes('monarch'));
    assert.equal(hasMonarch, true, 'Expected monarch label');
  });

  it('generates mantis labels for mantis images', async () => {
    const labels = await identificationService.annotateImage('https://example.com/praying_mantis.jpg');
    const hasMantis = labels.some((l) => l.description.toLowerCase().includes('mantis'));
    assert.equal(hasMantis, true, 'Expected mantis label');
  });

  it('returns null when matching empty labels array', async () => {
    const match = await identificationService.matchLabelsToSpecies([]);
    assert.equal(match, null);
  });
});
