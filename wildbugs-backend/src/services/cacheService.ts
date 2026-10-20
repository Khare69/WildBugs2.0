import { redisConnection } from '../database/redis';

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Retrieves an item from Redis cache with memory fallback.
   */
  public async get<T>(key: string): Promise<T | null> {
    // 1. Try Redis cache if connection is active
    if (redisConnection && redisConnection.status === 'ready') {
      try {
        const cached = await redisConnection.get(key);
        if (cached !== null) {
          return JSON.parse(cached) as T;
        }
      } catch (err) {
        // Fall back gracefully to memory cache
      }
    }

    // 2. Fall back to in-memory cache
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      if (Date.now() < memoryItem.expiresAt) {
        return memoryItem.data as T;
      }
      this.memoryCache.delete(key);
    }

    return null;
  }

  /**
   * Stores an item into cache with a TTL in seconds.
   */
  public async set<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
    // 1. Store in in-memory fallback cache
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // 2. Store in Redis if ready
    if (redisConnection && redisConnection.status === 'ready') {
      try {
        const serialized = JSON.stringify(data);
        if (ttlSeconds > 0) {
          await redisConnection.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await redisConnection.set(key, serialized);
        }
      } catch (err) {
        // Redis down: memory cache already has the value
      }
    }
  }

  /**
   * Invalidates keys matching a pattern.
   * e.g. invalidate('species:*') or invalidate('map:*')
   */
  public async invalidate(pattern: string): Promise<void> {
    // 1. Invalidate memory cache
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regexPattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // 2. Invalidate Redis keys
    if (redisConnection && redisConnection.status === 'ready') {
      try {
        const keys = await redisConnection.keys(pattern);
        if (keys.length > 0) {
          await redisConnection.del(...keys);
        }
      } catch (err) {
        // Graceful handling
      }
    }
  }

  /**
   * Clears all memory cache keys (useful for test isolation).
   */
  public clearMemory(): void {
    this.memoryCache.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
