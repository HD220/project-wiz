import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/user-activity-store'; // Adjusted path
import type { PlaceholderActivity } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current user activity list, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedUserActivity(): PlaceholderActivity[] {
  const activities = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return activities || [];
}
