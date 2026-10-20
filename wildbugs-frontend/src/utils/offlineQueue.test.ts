import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getOfflineQueue,
  enqueueOfflineSighting,
  removeFromOfflineQueue,
  clearOfflineQueue,
  processOfflineQueue,
  type QueuedSighting,
} from './offlineQueue.ts';

describe('IndexedDB Offline Queue Unit Tests', () => {
  test('starts with an empty queue after clear', async () => {
    await clearOfflineQueue();
    const queue = await getOfflineQueue();
    assert.deepEqual(queue, []);
  });

  test('enqueues a sighting with valid metadata and pending status', async () => {
    await clearOfflineQueue();

    // Mock Blob in Node test environment
    const mockBlob = new Blob(['mock-image-binary-data'], { type: 'image/jpeg' });

    const item = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'test-mantis.jpg',
      photoType: 'image/jpeg',
      latitude: 28.5147,
      longitude: 77.2625,
      speciesId: 1,
      observedAt: '2026-10-20T10:00:00.000Z',
    });

    assert.ok(item.id.startsWith('queued_'));
    assert.equal(item.latitude, 28.5147);
    assert.equal(item.longitude, 77.2625);
    assert.equal(item.speciesId, 1);
    assert.equal(item.status, 'pending');
    assert.equal(item.retryCount, 0);

    const queue = await getOfflineQueue();
    assert.equal(queue.length, 1);
    assert.equal(queue[0].id, item.id);
  });

  test('removes an item from queue by id', async () => {
    await clearOfflineQueue();

    const mockBlob = new Blob(['data'], { type: 'image/png' });
    const item1 = await enqueueOfflineSighting({
      photo: mockBlob,
      latitude: 10,
      longitude: 20,
    });
    const item2 = await enqueueOfflineSighting({
      photo: mockBlob,
      latitude: 30,
      longitude: 40,
    });

    let queue = await getOfflineQueue();
    assert.equal(queue.length, 2);

    await removeFromOfflineQueue(item1.id);
    queue = await getOfflineQueue();
    assert.equal(queue.length, 1);
    assert.equal(queue[0].id, item2.id);
  });

  test('processOfflineQueue removes succeeded items and retains failed items with retryCount', async () => {
    await clearOfflineQueue();

    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    const itemGood = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'good.jpg',
      latitude: 15,
      longitude: 25,
    });
    const itemBad = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'bad.jpg',
      latitude: 35,
      longitude: 45,
    });

    const mockUploader = async (item: QueuedSighting) => {
      if (item.photoName === 'bad.jpg') {
        throw new Error('Network timeout during upload');
      }
      return { success: true };
    };

    const result = await processOfflineQueue(mockUploader);
    assert.equal(result.total, 2);
    assert.equal(result.succeeded, 1);
    assert.equal(result.failed, 1);

    const remaining = await getOfflineQueue();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, itemBad.id);
    assert.equal(remaining[0].status, 'failed');
    assert.equal(remaining[0].retryCount, 1);
    assert.equal(remaining[0].errorMessage, 'Network timeout during upload');
  });
});
