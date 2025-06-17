import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/stores/project-list-store';
import type { ProjectType } from '@/types/project';

/**
 * Hook to get the current project list, updated in real-time via IPC events
 * from the Electron main process.
 *
 * Returns an array of ProjectType objects. Defaults to an empty array if
 * data is not yet available or an error occurred during initialization in the store.
 */
export function useSyncedProjectList(): ProjectType[] {
  // The third argument to useSyncExternalStore, getServerSnapshot, is optional.
  // For client-side Electron apps, providing getSnapshot again is common.
  const projectList = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return projectList;
}
