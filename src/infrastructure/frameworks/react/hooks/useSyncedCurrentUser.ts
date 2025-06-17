import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/user-data-store'; // Adjusted path
import type { UserQueryOutput } from '@/core/application/queries/user.query'; // For return type

/**
 * Hook to get the current user data, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedCurrentUser(): UserQueryOutput | null {
  // The third argument to useSyncExternalStore, getServerSnapshot, is optional.
  // If provided, it's used during server rendering and hydration.
  // For client-side Electron apps, providing getSnapshot again is common,
  // or it can be omitted if no server rendering/hydration differences are expected.
  const currentUser = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return currentUser;
}
