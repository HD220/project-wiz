import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/direct-message-threads-store'; // Adjusted path
import type { DirectMessageThreadPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current direct message threads, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedDirectMessageThreads(): DirectMessageThreadPlaceholder[] {
  const threads = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return threads || [];
}
