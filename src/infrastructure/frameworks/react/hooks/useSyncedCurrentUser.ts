import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/stores/user-data-store';
import type { UserQueryOutput } from '@/core/application/queries/user.query'; // For return type

/**
 * Hook to get the current user data, updated in real-time via IPC events
 * from the Electron main process.
 *
 * Returns the user object (UserQueryOutput) or null if no user is logged in
 * or data is not yet available.
 * If UserQueryOutput is an array (e.g., UserDTO[]), this hook will return that array or null.
 * Consumers might need to extract the first element if a single user object is expected.
 * Based on user-data-store.ts, currentUserSnapshot is UserQueryOutput | null.
 */
export function useSyncedCurrentUser(): UserQueryOutput | null {
  // The third argument to useSyncExternalStore, getServerSnapshot, is optional.
  // If provided, it's used during server rendering and hydration.
  // For client-side Electron apps, providing getSnapshot again is common,
  // or it can be omitted if no server rendering/hydration differences are expected.
  const currentUser = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return currentUser;
}
