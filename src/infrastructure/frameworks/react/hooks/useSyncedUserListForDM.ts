import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/user-list-for-dm-store'; // Adjusted path
import type { UserPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current user list for DMs, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedUserListForDM(): UserPlaceholder[] {
  const users = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return users || [];
}
