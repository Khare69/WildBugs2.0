import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { imageService } from '../../../src/services/imageService';

describe('ImageService Unit Tests', () => {
  it('generates image URL and 300x300 thumbnail URL from buffer', async () => {
    const dummyBuffer = Buffer.from('fake-image-bytes-jpeg');
    const result = await imageService.uploadImage(dummyBuffer, 'wildbugs/test_sightings');

    assert.ok(result.url, 'Expected url to be present');
    assert.ok(result.thumbnailUrl, 'Expected thumbnailUrl to be present');
    assert.ok(result.publicId, 'Expected publicId to be present');
    assert.match(result.thumbnailUrl, /c_fill,h_300,w_300|w_300,h_300,c_fill/, 'Expected thumbnail transform');
    assert.equal(result.bytes, dummyBuffer.length);
  });

  it('handles deleteImage gracefully', async () => {
    const success = await imageService.deleteImage('mock_image_id');
    assert.equal(typeof success, 'boolean');
  });
});
