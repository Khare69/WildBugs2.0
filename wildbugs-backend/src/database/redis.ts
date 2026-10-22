import Redis, { RedisOptions } from 'ioredis';
import env from '../config/env';

/**
 * Standard Redis options required for BullMQ queues and workers.
 * BullMQ requires `maxRetriesPerRequest: null` and `enableReadyCheck: false`.
 */
export const redisConfig: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times: number) {
    if (env.NODE_ENV === 'test') {
      // Avoid hanging reconnection attempts during test runs
      return null;
    }
    // Jittered exponential backoff: prevents thundering herd on redis restart
    return Math.min(times * 150 + Math.random() * 200, 3000);
  },
};

/**
 * Factory creating an independent Redis client.
 */
export const createRedisClient = (customUrl?: string): Redis => {
  const url = customUrl || env.REDIS_URL || 'redis://localhost:6379';
  const client = new Redis(url, redisConfig);

  client.on('connect', () => {
    if (env.NODE_ENV !== 'test') {
      console.log('✅ Connected to Redis cache & message broker');
    }
  });

  client.on('error', (err) => {
    // Suppress unhandled crash when Redis is offline in development or test
    if (env.NODE_ENV !== 'test') {
      console.warn('⚠️ [Redis Connection Warning]:', err.message);
    }
  });

  return client;
};

/**
 * Shared singleton Redis connection for queues.
 */
export const redisConnection = createRedisClient();

/**
 * Closes the shared Redis connection.
 */
export const closeRedis = async (): Promise<void> => {
  if (redisConnection.status !== 'end') {
    try {
      redisConnection.disconnect();
    } catch {
      // Disconnect cleanly
    }
  }
};

export default redisConnection;
