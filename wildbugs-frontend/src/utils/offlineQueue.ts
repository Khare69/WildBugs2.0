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

  for (const item of queue) {
    try {
      item.status = 'uploading';
      await uploadHandler(item);
      succeeded++;
      // Successfully uploaded: item is omitted from remainingQueue
    } catch (err: unknown) {
      failed++;
      item.status = 'failed';
      item.retryCount = (item.retryCount || 0) + 1;
      item.errorMessage = err instanceof Error ? err.message : 'Upload failed';
      remainingQueue.push(item);
    }
  }

  await persistQueue(remainingQueue);
  return { succeeded, failed, total: queue.length };
};
