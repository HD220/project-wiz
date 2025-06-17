import { useSyncExternalStore } from 'react';
import {
    subscribe,
    getSnapshot
} from '@/infrastructure/frameworks/react/stores/project-nav-items-store';
import type { ProjectNavItemsState } from '@/infrastructure/frameworks/react/stores/project-nav-items-store';

/**
 * Hook to get the nav items for the active project, loading state, and active project ID.
 * Data is updated in real-time if the store receives IPC events for the active project.
 *
 * To load or change project nav items, import and call `loadNavItemsForProject(projectId)`
 * from `@/infrastructure/frameworks/react/stores/project-nav-items-store` directly in your component.
 */
export function useSyncedProjectNavItems(): ProjectNavItemsState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
