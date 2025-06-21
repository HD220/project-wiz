import type { ProjectChannelPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders';

export type ProjectChannelsState = {
  channels: ProjectChannelPlaceholder[] | null;
  isLoading: boolean;
  activeProjectIdForChannels: string | null;
};

// Augment Window interface (assuming it's correctly defined for onProjectChannelsChanged and api.invoke)
declare global {
  interface Window {
    electronAPI?: {
      onProjectChannelsChanged: (callback: (data: { projectId: string; channels: ProjectChannelPlaceholder[] | null }) => void) => void;
      removeProjectChannelsChangedListener: (callback: (data: { projectId: string; channels: ProjectChannelPlaceholder[] | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let storeState: ProjectChannelsState = {
  channels: null,
  isLoading: false,
  activeProjectIdForChannels: null,
};

const listeners = new Set<() => void>();

export function getSnapshot(): ProjectChannelsState {
  return storeState;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange(): void {
  storeState = { ...storeState }; // Ensure new object for change detection
  for (const listener of listeners) {
    listener();
  }
}

function handleProjectChannelsChanged(data: { projectId: string; channels: ProjectChannelPlaceholder[] | null }): void {
  console.log("project-channels-store: Received project channels update via IPC", data);
  if (data.projectId === storeState.activeProjectIdForChannels) {
    storeState.channels = data.channels || []; // Ensure array or null
    storeState.isLoading = false; // Assume IPC update means loading is done
    emitChange();
  }
}

export async function loadChannelsForProject(projectId: string | null): Promise<void> {
  if (!projectId) {
    console.log("project-channels-store: Project ID is null, clearing channels.");
    storeState.activeProjectIdForChannels = null;
    storeState.channels = null;
    storeState.isLoading = false;
    emitChange();
    return;
  }

  // if (storeState.activeProjectIdForChannels === projectId && storeState.channels !== null && !storeState.isLoading) {
  //   console.log(`project-channels-store: Channels for project ${projectId} already loaded.`);
  //   return;
  // }

  console.log(`project-channels-store: Loading channels for project ${projectId}...`);
  storeState.activeProjectIdForChannels = projectId;
  storeState.channels = null;
  storeState.isLoading = true;
  emitChange();

  if (window.api?.invoke) {
    try {
      const channels = await window.api.invoke("query:get-project-channels", { projectId }) as ProjectChannelPlaceholder[] | null;
      console.log(`project-channels-store: Initial channels for project ${projectId} fetched:`, channels);
      if (storeState.activeProjectIdForChannels === projectId) {
        storeState.channels = channels || [];
      }
    } catch (error) {
      console.error(`project-channels-store: Failed to initialize channels for ${projectId}:`, error);
      if (storeState.activeProjectIdForChannels === projectId) {
        storeState.channels = null;
      }
    } finally {
      if (storeState.activeProjectIdForChannels === projectId) {
        storeState.isLoading = false;
      }
    }
  } else {
    console.warn("project-channels-store: window.api.invoke is not available.");
    if (storeState.activeProjectIdForChannels === projectId) {
      storeState.channels = null;
      storeState.isLoading = false;
    }
  }
  emitChange();
}

let ipcListenerInitialized = false;
function initializeGlobalListener(): void {
    if (ipcListenerInitialized) return;
    if (window.electronAPI?.onProjectChannelsChanged) {
        window.electronAPI.onProjectChannelsChanged(handleProjectChannelsChanged);
        console.log("project-channels-store: Subscribed to project channels changes via IPC.");
        ipcListenerInitialized = true;
    } else {
        console.warn("project-channels-store: window.electronAPI.onProjectChannelsChanged is not available.");
    }
}

initializeGlobalListener();
