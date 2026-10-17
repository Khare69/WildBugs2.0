import { Queue, Worker, Processor, Job } from 'bullmq';
import { redisConnection, createRedisClient } from '../database/redis';

export interface IdentificationJobData {
  sightingId: string;
  imageUrl: string;
}

export const IDENTIFICATION_QUEUE_NAME = 'identification';

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
 * Sets up a BullMQ Worker to process identification jobs using an independent Redis client.
 */
export const setupIdentificationWorker = (
  processor: Processor<IdentificationJobData>
): Worker<IdentificationJobData> => {
  // BullMQ workers require their own dedicated Redis connection
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
 * Closes the identification queue cleanly.
 */
export const closeIdentificationQueue = async (): Promise<void> => {
  await identificationQueue.close();
};

export default identificationQueue;
