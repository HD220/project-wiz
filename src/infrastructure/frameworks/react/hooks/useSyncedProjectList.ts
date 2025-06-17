import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/project-list-store'; // Adjusted path
import type { ProjectType } from '@/types/project'; // For return type, assuming this is the correct type for projects

/**
 * Hook to get the current project list, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedProjectList(): ProjectType[] {
  // Using getSnapshot for getServerSnapshot as it's a client-side Electron app.
  const projectList = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return projectList || []; // Ensure it returns an array, even if snapshot is null initially (though store initializes to [])
}
