import type { PlaceholderTask, PlaceholderTeamMember } from '@/infrastructure/frameworks/react/lib/placeholders';

export type ProjectDetailsData = {
  tasks: PlaceholderTask[];
  teamMembers: PlaceholderTeamMember[];
};

export type ProjectDetailsState = {
  details: ProjectDetailsData | null;
  isLoading: boolean;
  activeProjectId: string | null;
};

// Augment Window interface (assuming it's already correctly defined for onProjectDetailsChanged and api.invoke)
declare global {
  interface Window {
    electronAPI?: {
      onProjectDetailsChanged: (callback: (data: { projectId: string; details: ProjectDetailsData | null }) => void) => void;
      removeProjectDetailsChangedListener: (callback: (data: { projectId: string; details: ProjectDetailsData | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let storeState: ProjectDetailsState = {
  details: null,
  isLoading: false,
  activeProjectId: null,
};

const listeners = new Set<() => void>();

export function getSnapshot(): ProjectDetailsState {
  return storeState;
}

// getActiveProjectId can be removed if activeProjectId is part of getSnapshot()
// export function getActiveProjectId(): string | null {
//   return storeState.activeProjectId;
// }

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange(): void {
  // Ensure a new object is created for the state to trigger react's change detection
  // if components are memoizing based on object identity.
  storeState = { ...storeState };
  for (const listener of listeners) {
    listener();
  }
}

function handleProjectDetailsChanged(data: { projectId: string; details: ProjectDetailsData | null }): void {
  console.log("project-details-store: Received project details update via IPC", data);
  if (data.projectId === storeState.activeProjectId) {
    storeState.details = data.details || null;
    storeState.isLoading = false; // Assume IPC update means loading is done for this project
    emitChange();
  }
}

export async function loadProjectDetails(projectId: string | null): Promise<void> {
  if (!projectId) {
    console.log("project-details-store: Project ID is null, clearing details.");
    storeState.activeProjectId = null;
    storeState.details = null;
    storeState.isLoading = false;
    emitChange();
    return;
  }

  // No change if already active and loaded, unless a force refresh is implemented
  // if (storeState.activeProjectId === projectId && storeState.details !== null && !storeState.isLoading) {
  //   console.log(`project-details-store: Details for project ${projectId} already loaded and not loading.`);
  //   return;
  // }

  console.log(`project-details-store: Loading details for project ${projectId}...`);
  storeState.activeProjectId = projectId;
  storeState.details = null; // Clear previous project's details or keep them if preferred (e.g. for caching)
  storeState.isLoading = true;
  emitChange();

  if (window.api?.invoke) {
    try {
      const details = await window.api.invoke("query:get-project-details", { projectId }) as ProjectDetailsData | null;
      console.log(`project-details-store: Initial details for project ${projectId} fetched:`, details);
      if (storeState.activeProjectId === projectId) { // Check if project context changed during async operation
        storeState.details = details || null;
      }
    } catch (error) {
      console.error(`project-details-store: Failed to initialize project details for ${projectId}:`, error);
      if (storeState.activeProjectId === projectId) {
        storeState.details = null;
      }
    } finally {
      if (storeState.activeProjectId === projectId) {
        storeState.isLoading = false;
      }
    }
  } else {
    console.warn("project-details-store: window.api.invoke is not available.");
    if (storeState.activeProjectId === projectId) {
      storeState.details = null;
      storeState.isLoading = false;
    }
  }
  emitChange();
}

let ipcListenerInitialized = false;
function initializeGlobalListener(): void {
    if (ipcListenerInitialized) return;
    if (window.electronAPI?.onProjectDetailsChanged) {
        window.electronAPI.onProjectDetailsChanged(handleProjectDetailsChanged);
        console.log("project-details-store: Subscribed to project details changes via IPC.");
        ipcListenerInitialized = true;
    } else {
        console.warn("project-details-store: window.electronAPI.onProjectDetailsChanged is not available.");
    }
}

initializeGlobalListener();
