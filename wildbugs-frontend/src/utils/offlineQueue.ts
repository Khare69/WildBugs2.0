import { get, set, del } from 'idb-keyval';

export interface QueuedSighting {
  id: string;
  photoBlob: Blob;
  photoName: string;
  photoType: string;
  latitude: number;
  longitude: number;
  speciesId?: number;
  observedAt?: string;
  createdAt: number;
  status: 'pending' | 'uploading' | 'failed';
  errorMessage?: string;
  retryCount: number;
}

export interface EnqueueSightingInput {
  photo: File | Blob;
  photoName?: string;
  photoType?: string;
  latitude: number;
  longitude: number;
  speciesId?: number;
  observedAt?: string;
}

export interface OfflineQueueMetrics {
  total: number;
  pendingCount: number;
  failedCount: number;
}

/**
 * Calculate status-filtered queue counters to isolate active items from quarantined dead-letter items
 */
export const calculateQueueMetrics = (queue: QueuedSighting[]): OfflineQueueMetrics => {
  // Only count active items awaiting sync; exclude quarantined/failed items from pending badge
  const pendingCount = queue.filter(
    (item) => item.status === 'pending' || item.status === 'uploading'
  ).length;
  const failedCount = queue.filter((item) => item.status === 'failed').length;
  return {
    total: queue.length,
    pendingCount,
    failedCount,
  };
};

const STORAGE_KEY = 'wildbugs_offline_sightings_queue';

// In-memory fallback for non-browser / unit test environments
const memoryQueue: Map<string, QueuedSighting> = new Map();

const isIndexedDbAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
};

/**
 * Fetch all items currently in the offline queue
 */
export const getOfflineQueue = async (): Promise<QueuedSighting[]> => {
  if (!isIndexedDbAvailable()) {
    return Array.from(memoryQueue.values()).sort((a, b) => a.createdAt - b.createdAt);
  }

  try {
    const queue = (await get<QueuedSighting[]>(STORAGE_KEY)) || [];
    return queue.sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to load from IndexedDB, using memory queue:', err);
    return Array.from(memoryQueue.values()).sort((a, b) => a.createdAt - b.createdAt);
  }
};

/**
 * Persist the entire queue to IndexedDB or memory
 */
const persistQueue = async (queue: QueuedSighting[]): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    memoryQueue.clear();
    queue.forEach((item) => memoryQueue.set(item.id, item));
    return;
  }

  try {
    await set(STORAGE_KEY, queue);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to save to IndexedDB, fallback to memory:', err);
    memoryQueue.clear();
    queue.forEach((item) => memoryQueue.set(item.id, item));
  }
};

/**
 * Add a new observation sighting to the offline sync queue
 */
export const enqueueOfflineSighting = async (
  input: EnqueueSightingInput
): Promise<QueuedSighting> => {
  const queue = await getOfflineQueue();

  const id = `queued_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const photoName = input.photoName || (input.photo instanceof File ? input.photo.name : 'observation.jpg');
  const photoType = input.photoType || input.photo.type || 'image/jpeg';

  const newItem: QueuedSighting = {
    id,
    photoBlob: input.photo,
    photoName,
    photoType,
    latitude: input.latitude,
    longitude: input.longitude,
    speciesId: input.speciesId,
    observedAt: input.observedAt || new Date().toISOString(),
    createdAt: Date.now(),
    status: 'pending',
    retryCount: 0,
  };

  queue.push(newItem);
  await persistQueue(queue);

  return newItem;
};

/**
 * Remove an item from the offline sync queue by ID
 */
export const removeFromOfflineQueue = async (id: string): Promise<void> => {
  const queue = await getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await persistQueue(filtered);
};

/**
 * Clear all items from the offline queue
 */
export const clearOfflineQueue = async (): Promise<void> => {
  if (!isIndexedDbAvailable()) {
    memoryQueue.clear();
    return;
  }

  try {
    await del(STORAGE_KEY);
    memoryQueue.clear();
  } catch (err) {
    console.warn('[OfflineQueue] Failed to clear IndexedDB:', err);
    memoryQueue.clear();
  }
};

export const MAX_OFFLINE_RETRIES = 5;

/**
 * Process all pending items in the offline queue sequentially
 */
export const processOfflineQueue = async (
  uploadHandler: (item: QueuedSighting) => Promise<unknown>
): Promise<{ succeeded: number; failed: number; total: number }> => {
  const queue = await getOfflineQueue();
  if (queue.length === 0) {
    return { succeeded: 0, failed: 0, total: 0 };
  }

  let succeeded = 0;
  let failed = 0;
  const remainingQueue: QueuedSighting[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];

    // Skip already quarantined items during standard processing loop
    if (item.status === 'failed' && (item.retryCount || 0) >= MAX_OFFLINE_RETRIES) {
      remainingQueue.push(item);
      continue;
    }

    try {
      item.status = 'uploading';
      await uploadHandler(item);
      succeeded++;
      // Polite spacing delay (250ms) prevents triggering rate limits on reconnect
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (err: unknown) {
      failed++;
      const isRateLimited =
        (err as { response?: { status?: number }; status?: number })?.response?.status === 429 ||
        (err as { response?: { status?: number }; status?: number })?.status === 429;

      item.errorMessage = err instanceof Error ? err.message : 'Upload failed';

      // HTTP 429 Awareness & Backoff Pause: do not burn retries on rate limits
      if (isRateLimited) {
        item.status = 'pending';
        console.warn(`[OfflineQueue] Rate limit encountered during offline sync on item ${item.id}. Pausing queue.`);
        remainingQueue.push(item);
        // Retain remaining unattempted items without modification
        for (let j = i + 1; j < queue.length; j++) {
          remainingQueue.push(queue[j]);
        }
        break;
      }

      item.retryCount = (item.retryCount || 0) + 1;

      // Quarantine items exceeding max retries to break infinite replay loops
      if (item.retryCount >= MAX_OFFLINE_RETRIES) {
        item.status = 'failed';
        console.warn(`[OfflineQueue] Item ${item.id} quarantined after ${item.retryCount} failed attempts.`);
      } else {
        item.status = 'pending';
      }
      remainingQueue.push(item);
    }
  }

  await persistQueue(remainingQueue);
  return { succeeded, failed, total: queue.length };
};

/**
 * Discard a quarantined item from the offline queue
 */
export const discardQuarantinedItem = async (id: string): Promise<void> => {
  await removeFromOfflineQueue(id);
};

/**
 * Reset retry count and status of a quarantined item to re-attempt sync
 */
export const retryQuarantinedItem = async (id: string): Promise<void> => {
  const queue = await getOfflineQueue();
  const item = queue.find((i) => i.id === id);
  if (item) {
    item.status = 'pending';
    item.retryCount = 0;
    item.errorMessage = undefined;
    await persistQueue(queue);
  }
};
