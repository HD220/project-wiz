import { useSyncExternalStore } from 'react';
import {
    subscribe,
    getSnapshot,
    // No longer directly calling loadProjectDetails from the hook,
    // but components will import it from the store.
    // loadProjectDetails
} from '@/infrastructure/frameworks/react/stores/project-details-store';
import type { ProjectDetailsState } from '@/infrastructure/frameworks/react/stores/project-details-store';

/**
 * Hook to get the current project details (tasks, team members), loading state, and active project ID.
 * Data is updated in real-time if the store receives IPC events for the active project.
 *
 * To load or change project details, import and call `loadProjectDetails(projectId)`
 * from `@/infrastructure/frameworks/react/stores/project-details-store` directly in your component.
 */
export function useSyncedProjectDetails(): ProjectDetailsState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
