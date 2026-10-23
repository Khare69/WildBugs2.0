import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateQueueMetrics } from '../utils/offlineQueue.ts';
import type { QueuedSighting } from '../utils/offlineQueue.ts';

describe('useOfflineQueue Hook Logic Unit Tests', () => {
  const createMockItem = (id: string, status: 'pending' | 'uploading' | 'failed', retryCount = 0): QueuedSighting => ({
    id,
    photoBlob: new Blob(['mock'], { type: 'image/jpeg' }),
    photoName: `${id}.jpg`,
    photoType: 'image/jpeg',
    latitude: 28.5,
    longitude: 77.2,
    createdAt: Date.now(),
    status,
    retryCount,
  });

  test('calculateQueueMetrics returns 0 counts for an empty queue', () => {
    const metrics = calculateQueueMetrics([]);
    assert.equal(metrics.total, 0);
    assert.equal(metrics.pendingCount, 0);
    assert.equal(metrics.failedCount, 0);
  });

  test('calculateQueueMetrics correctly tallies pending and uploading items', () => {
    const queue: QueuedSighting[] = [
      createMockItem('item-1', 'pending'),
      createMockItem('item-2', 'uploading'),
      createMockItem('item-3', 'pending'),
    ];

    const metrics = calculateQueueMetrics(queue);
    assert.equal(metrics.total, 3);
    assert.equal(metrics.pendingCount, 3);
    assert.equal(metrics.failedCount, 0);
  });

  test('calculateQueueMetrics excludes failed/quarantined items from pendingCount', () => {
    const queue: QueuedSighting[] = [
      createMockItem('item-1', 'pending', 0),
      createMockItem('item-2', 'failed', 5), // Quarantined DLQ item
      createMockItem('item-3', 'failed', 5), // Quarantined DLQ item
      createMockItem('item-4', 'uploading', 1),
    ];

    const metrics = calculateQueueMetrics(queue);
    assert.equal(metrics.total, 4);
    // Only item-1 and item-4 are counted as actionable pending
    assert.equal(metrics.pendingCount, 2);
    // Quarantined failed items are isolated into failedCount
    assert.equal(metrics.failedCount, 2);
  });

  test('calculateQueueMetrics reports 0 pending when all items are quarantined', () => {
    const queue: QueuedSighting[] = [
      createMockItem('item-1', 'failed', 5),
      createMockItem('item-2', 'failed', 6),
    ];

    const metrics = calculateQueueMetrics(queue);
    assert.equal(metrics.total, 2);
    assert.equal(metrics.pendingCount, 0);
    assert.equal(metrics.failedCount, 2);
  });
});
