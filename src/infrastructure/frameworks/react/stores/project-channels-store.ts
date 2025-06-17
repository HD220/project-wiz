import type { ProjectChannelPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onProjectChannelsChanged: (callback: (data: { projectId: string; channels: ProjectChannelPlaceholder[] | null }) => void) => void;
      removeProjectChannelsChangedListener: (callback: (data: { projectId: string; channels: ProjectChannelPlaceholder[] | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let currentChannelsSnapshot: ProjectChannelPlaceholder[] | null = null;
let activeProjectIdForChannels: string | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): ProjectChannelPlaceholder[] | null {
  return currentChannelsSnapshot;
}

export function getActiveProjectIdForChannels(): string | null {
  return activeProjectIdForChannels;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleProjectChannelsChanged(data: { projectId: string; channels: ProjectChannelPlaceholder[] | null }): void {
  console.log("project-channels-store: Received project channels update via IPC", data);
  if (data.projectId === activeProjectIdForChannels) {
    currentChannelsSnapshot = data.channels || []; // Ensure array or null
    emitChange();
  }
}

export async function loadChannelsForProject(projectId: string | null): Promise<void> {
  if (!projectId) {
    console.log("project-channels-store: Project ID is null, clearing channels.");
    activeProjectIdForChannels = null;
    currentChannelsSnapshot = null;
    emitChange();
    return;
  }

  if (activeProjectIdForChannels === projectId && currentChannelsSnapshot !== null) {
    console.log(`project-channels-store: Channels for project ${projectId} already loaded.`);
    return;
  }

  console.log(`project-channels-store: Loading channels for project ${projectId}...`);
  activeProjectIdForChannels = projectId;
  currentChannelsSnapshot = null;
  emitChange();

  if (window.api?.invoke) {
    try {
      const channels = await window.api.invoke("query:get-project-channels", { projectId }) as ProjectChannelPlaceholder[] | null;
      console.log(`project-channels-store: Initial channels for project ${projectId} fetched:`, channels);
      if(activeProjectIdForChannels === projectId) {
        currentChannelsSnapshot = channels || [];
      }
    } catch (error) {
      console.error(`project-channels-store: Failed to initialize channels for ${projectId}:`, error);
      if(activeProjectIdForChannels === projectId) {
        currentChannelsSnapshot = null;
      }
    }
  } else {
    console.warn("project-channels-store: window.api.invoke is not available.");
    if(activeProjectIdForChannels === projectId) {
      currentChannelsSnapshot = null;
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
