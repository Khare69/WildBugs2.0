import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getOfflineQueue,
  enqueueOfflineSighting,
  removeFromOfflineQueue,
  clearOfflineQueue,
  processOfflineQueue,
  MAX_OFFLINE_RETRIES,
  discardQuarantinedItem,
  retryQuarantinedItem,
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

  test('processOfflineQueue removes succeeded items and retains failed items with retryCount and pending status', async () => {
    await clearOfflineQueue();

    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    await enqueueOfflineSighting({
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
    // On first failure (< MAX_OFFLINE_RETRIES), remains pending for automatic retry
    assert.equal(remaining[0].status, 'pending');
    assert.equal(remaining[0].retryCount, 1);
    assert.equal(remaining[0].errorMessage, 'Network timeout during upload');
  });

  test('quarantines items with status failed after reaching MAX_OFFLINE_RETRIES', async () => {
    await clearOfflineQueue();

    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    const itemPoison = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'poison-pill.jpg',
      latitude: 12,
      longitude: 77,
    });

    const failingUploader = async () => {
      throw new Error('400 Bad Request: Invalid format');
    };

    // Run processOfflineQueue MAX_OFFLINE_RETRIES times
    for (let i = 0; i < MAX_OFFLINE_RETRIES; i++) {
      await processOfflineQueue(failingUploader);
    }

    const queue = await getOfflineQueue();
    assert.equal(queue.length, 1);
    assert.equal(queue[0].id, itemPoison.id);
    assert.equal(queue[0].retryCount, MAX_OFFLINE_RETRIES);
    assert.equal(queue[0].status, 'failed'); // Quarantined in Dead-Letter Queue
  });

  test('skips already quarantined items during standard processing', async () => {
    const queueBefore = await getOfflineQueue();
    assert.equal(queueBefore.length, 1);
    assert.equal(queueBefore[0].status, 'failed');

    let uploaderCalled = false;
    const mockUploader = async () => {
      uploaderCalled = true;
    };

    // Processing should skip the quarantined item
    const result = await processOfflineQueue(mockUploader);
    assert.equal(uploaderCalled, false);
    assert.equal(result.succeeded, 0);
    assert.equal(result.failed, 0);

    const queueAfter = await getOfflineQueue();
    assert.equal(queueAfter.length, 1);
    assert.equal(queueAfter[0].status, 'failed');
  });

  test('handles HTTP 429 rate limit backoff without incrementing retry count', async () => {
    await clearOfflineQueue();

    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    const item1 = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'sighting-1.jpg',
      latitude: 10,
      longitude: 20,
    });
    const item2 = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'sighting-2.jpg',
      latitude: 11,
      longitude: 21,
    });

    const rateLimitedUploader = async () => {
      const error: any = new Error('Too Many Requests');
      error.response = { status: 429 };
      throw error;
    };

    const result = await processOfflineQueue(rateLimitedUploader);
    assert.equal(result.failed, 1);

    const remaining = await getOfflineQueue();
    assert.equal(remaining.length, 2);
    // item1 was paused due to 429: retryCount must NOT be incremented
    assert.equal(remaining[0].id, item1.id);
    assert.equal(remaining[0].retryCount, 0);
    assert.equal(remaining[0].status, 'pending');
    // item2 was skipped without modification
    assert.equal(remaining[1].id, item2.id);
    assert.equal(remaining[1].retryCount, 0);
    assert.equal(remaining[1].status, 'pending');
  });

  test('discardQuarantinedItem removes item and retryQuarantinedItem resets state', async () => {
    await clearOfflineQueue();

    const mockBlob = new Blob(['data'], { type: 'image/jpeg' });
    const item = await enqueueOfflineSighting({
      photo: mockBlob,
      photoName: 'quarantine-test.jpg',
      latitude: 10,
      longitude: 20,
    });

    // Manually simulate quarantined item
    item.status = 'failed';
    item.retryCount = 5;
    item.errorMessage = 'Permanently rejected';

    // Test retryQuarantinedItem resets state
    await retryQuarantinedItem(item.id);
    let queue = await getOfflineQueue();
    assert.equal(queue[0].status, 'pending');
    assert.equal(queue[0].retryCount, 0);
    assert.equal(queue[0].errorMessage, undefined);

    // Test discardQuarantinedItem
    await discardQuarantinedItem(item.id);
    queue = await getOfflineQueue();
    assert.equal(queue.length, 0);
  });
});
