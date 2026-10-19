import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  identificationQueue,
  IDENTIFICATION_QUEUE_NAME,
  badgeQueue,
  BADGE_QUEUE_NAME,
  closeQueues,
  closeIdentificationQueue,
} from '../../../src/jobs/queue';
import { redisConfig, closeRedis } from '../../../src/database/redis';

describe('Queue & Redis Infrastructure Unit Tests', () => {
  after(async () => {
    await closeQueues();
    await closeIdentificationQueue();
    await closeRedis();
  });

  it('configures identification BullMQ queue with correct name', () => {
    assert.equal(identificationQueue.name, IDENTIFICATION_QUEUE_NAME);
    assert.equal(IDENTIFICATION_QUEUE_NAME, 'identification');
  });

  it('configures badge BullMQ queue with correct name', () => {
    assert.equal(badgeQueue.name, BADGE_QUEUE_NAME);
    assert.equal(BADGE_QUEUE_NAME, 'badge-check');
  });

  it('configures Redis with maxRetriesPerRequest null for BullMQ compatibility', () => {
    assert.equal(redisConfig.maxRetriesPerRequest, null);
    assert.equal(redisConfig.enableReadyCheck, false);
  });
});
