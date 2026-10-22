import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cacheService } from '../../../src/services/cacheService';

describe('CacheService Unit Tests', () => {
  beforeEach(() => {
    cacheService.clearMemory();
  });

  test('sets and gets cached data correctly', async () => {
    await cacheService.set('test:key', { species: 'Monarch Butterfly', count: 42 }, 10);
    const cached = await cacheService.get<{ species: string; count: number }>('test:key');

    assert.ok(cached !== null);
    assert.equal(cached.species, 'Monarch Butterfly');
    assert.equal(cached.count, 42);
  });

  test('returns null for missing keys', async () => {
    const cached = await cacheService.get('non:existent:key');
    assert.equal(cached, null);
  });

  test('invalidates keys matching pattern correctly', async () => {
    await cacheService.set('species:list:1', { page: 1 }, 10);
    await cacheService.set('species:list:2', { page: 2 }, 10);
    await cacheService.set('map:heatmap:delhi', { intensity: 5 }, 10);

    // Invalidate species:*
    await cacheService.invalidate('species:*');

    const species1 = await cacheService.get('species:list:1');
    const species2 = await cacheService.get('species:list:2');
    const mapData = await cacheService.get('map:heatmap:delhi');

    assert.equal(species1, null);
    assert.equal(species2, null);
    assert.ok(mapData !== null);
  });

  test('handles expired TTL entries by returning null', async () => {
    // Set with negative TTL or 0 TTL
    await cacheService.set('expired:key', 'some-data', -1);
    const cached = await cacheService.get('expired:key');
    assert.equal(cached, null);
  });

  test('retrieves or computes via getOrSet correctly', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { computed: true };
    };

    const first = await cacheService.getOrSet('test:getOrSet', fetcher, 10);
    assert.deepEqual(first, { computed: true });
    assert.equal(callCount, 1);

    const second = await cacheService.getOrSet('test:getOrSet', fetcher, 10);
    assert.deepEqual(second, { computed: true });
    assert.equal(callCount, 1, 'Fetcher should not be called when value is cached');
  });
});
