import { useSyncExternalStore } from 'react';
import {
    subscribe,
    getSnapshot
} from '@/infrastructure/frameworks/react/stores/project-channels-store';
import type { ProjectChannelsState } from '@/infrastructure/frameworks/react/stores/project-channels-store';

/**
 * Hook to get the channels for the active project, loading state, and active project ID.
 * Data is updated in real-time if the store receives IPC events for the active project.
 *
 * To load or change project channels, import and call `loadChannelsForProject(projectId)`
 * from `@/infrastructure/frameworks/react/stores/project-channels-store` directly in your component.
 */
export function useSyncedProjectChannels(): ProjectChannelsState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
