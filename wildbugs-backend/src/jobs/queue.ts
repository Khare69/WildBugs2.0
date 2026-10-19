import { Queue, Worker, Processor, Job } from 'bullmq';
import { redisConnection, createRedisClient } from '../database/redis';

export interface IdentificationJobData {
  sightingId: string;
  imageUrl: string;
}

export interface BadgeJobData {
  userId: string;
}

export const IDENTIFICATION_QUEUE_NAME = 'identification';
export const BADGE_QUEUE_NAME = 'badge-check';

/**
 * BullMQ Queue for insect vision classification jobs.
 */
export const identificationQueue = new Queue<IdentificationJobData>(
  IDENTIFICATION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // keep completed jobs for 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 86400, // keep failed jobs for 24 hours for inspection
      },
    },
  }
);

/**
 * BullMQ Queue for milestone & streak badge evaluation jobs.
 */
export const badgeQueue = new Queue<BadgeJobData>(
  BADGE_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 86400,
      },
    },
  }
);

/**
 * Enqueues an insect sighting image for asynchronous AI vision identification.
 * Gracefully logs if Redis is offline so HTTP ingestion never fails.
 */
export const addIdentificationJob = async (
  sightingId: string,
  imageUrl: string
): Promise<Job<IdentificationJobData> | null> => {
  try {
    const job = await identificationQueue.add(
      'identify-insect',
      { sightingId, imageUrl },
      {
        jobId: `identify-${sightingId}`, // Deduplicate if re-triggered
      }
    );
    return job;
  } catch (err: unknown) {
    console.warn(
      `⚠️ [Queue Warning] Could not enqueue identification job for sighting ${sightingId}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
};

/**
 * Enqueues an observer for asynchronous milestone and badge eligibility verification.
 */
export const addBadgeCheckJob = async (
  userId: string
): Promise<Job<BadgeJobData> | null> => {
  try {
    const job = await badgeQueue.add(
      'check-badges',
      { userId },
      {
        jobId: `badges-${userId}-${Date.now()}`,
      }
    );
    return job;
  } catch (err: unknown) {
    console.warn(
      `⚠️ [Queue Warning] Could not enqueue badge check job for user ${userId}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
};

/**
 * Sets up a BullMQ Worker to process identification jobs using an independent Redis client.
 */
export const setupIdentificationWorker = (
  processor: Processor<IdentificationJobData>
): Worker<IdentificationJobData> => {
  const workerConnection = createRedisClient();

  const worker = new Worker<IdentificationJobData>(
    IDENTIFICATION_QUEUE_NAME,
    processor,
    {
      connection: workerConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job: Job) => {
    console.log(`[Worker] Sighting identification job ${job.id} completed successfully`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[Worker] Sighting identification job ${job?.id} failed:`, err.message);
  });

  return worker;
};

/**
 * Sets up a BullMQ Worker to process badge verification jobs using an independent Redis client.
 */
export const setupBadgeWorker = (
  processor: Processor<BadgeJobData>
): Worker<BadgeJobData> => {
  const workerConnection = createRedisClient();

  const worker = new Worker<BadgeJobData>(
    BADGE_QUEUE_NAME,
    processor,
    {
      connection: workerConnection,
      concurrency: 3,
    }
  );

  worker.on('completed', (job: Job) => {
    console.log(`[Worker] Badge verification job ${job.id} processed successfully`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[Worker] Badge verification job ${job?.id} failed:`, err.message);
  });

  return worker;
};

/**
 * Closes queues cleanly.
 */
export const closeQueues = async (): Promise<void> => {
  await Promise.all([
    identificationQueue.close(),
    badgeQueue.close(),
  ]);
};

export const closeIdentificationQueue = closeQueues;

export default identificationQueue;
