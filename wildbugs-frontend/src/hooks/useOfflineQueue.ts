import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getOfflineQueue,
  enqueueOfflineSighting,
  processOfflineQueue,
  clearOfflineQueue,
  type QueuedSighting,
  type EnqueueSightingInput,
} from '../utils/offlineQueue';
import { sightingsApi } from '../api/sightingsApi';

export interface UseOfflineQueueResult {
  isOnline: boolean;
  queueCount: number;
  isSyncing: boolean;
  queue: QueuedSighting[];
  syncNow: () => Promise<{ succeeded: number; failed: number; total: number }>;
  addToQueue: (input: EnqueueSightingInput) => Promise<QueuedSighting>;
  clearQueue: () => Promise<void>;
  lastSyncMessage: string | null;
}

export const useOfflineQueue = (): UseOfflineQueueResult => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [queueCount, setQueueCount] = useState<number>(0);
  const [queue, setQueue] = useState<QueuedSighting[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const isSyncingRef = useRef<boolean>(false);

  // Refresh local state representation of the queue
  const refreshQueueState = useCallback(async () => {
    try {
      const items = await getOfflineQueue();
      setQueue(items);
      setQueueCount(items.length);
    } catch (err) {
      console.warn('[useOfflineQueue] Error refreshing queue count:', err);
    }
  }, []);

  // Upload handler for single queued item
  const uploadQueuedItem = useCallback(async (item: QueuedSighting) => {
    const file =
      item.photoBlob instanceof File
        ? item.photoBlob
        : new File([item.photoBlob], item.photoName || 'observation.jpg', {
            type: item.photoType || 'image/jpeg',
          });

    await sightingsApi.createSighting({
      photo: file,
      latitude: item.latitude,
      longitude: item.longitude,
      speciesId: item.speciesId,
      observedAt: item.observedAt,
    });
  }, []);

  // Process all queued sightings sequentially
  const syncNow = useCallback(async (): Promise<{ succeeded: number; failed: number; total: number }> => {
    if (isSyncingRef.current) {
      return { succeeded: 0, failed: 0, total: 0 };
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await processOfflineQueue(uploadQueuedItem);
      await refreshQueueState();

      if (result.total > 0) {
        if (result.succeeded > 0 && result.failed === 0) {
          setLastSyncMessage(`Synced ${result.succeeded} offline ${result.succeeded === 1 ? 'observation' : 'observations'} successfully.`);
        } else if (result.succeeded > 0 && result.failed > 0) {
          setLastSyncMessage(`Synced ${result.succeeded} items. ${result.failed} items pending retry.`);
        } else if (result.failed > 0) {
          setLastSyncMessage(`Failed to sync ${result.failed} items. Will retry automatically.`);
        }
      }

      return result;
    } catch (err) {
      console.error('[useOfflineQueue] Error during synchronization:', err);
      return { succeeded: 0, failed: 0, total: 0 };
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [uploadQueuedItem, refreshQueueState]);

  // Add observation to queue
  const addToQueue = useCallback(
    async (input: EnqueueSightingInput): Promise<QueuedSighting> => {
      const item = await enqueueOfflineSighting(input);
      await refreshQueueState();
      return item;
    },
    [refreshQueueState]
  );

  // Clear queue
  const clearQueue = useCallback(async (): Promise<void> => {
    await clearOfflineQueue();
    await refreshQueueState();
  }, [refreshQueueState]);

  // Online / offline event listener lifecycle
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when reconnecting to network
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue check
    refreshQueueState();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow, refreshQueueState]);

  return {
    isOnline,
    queueCount,
    isSyncing,
    queue,
    syncNow,
    addToQueue,
    clearQueue,
    lastSyncMessage,
  };
};
