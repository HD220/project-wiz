import type { PlaceholderTask, PlaceholderTeamMember } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

export type ProjectDetailsData = {
  tasks: PlaceholderTask[];
  teamMembers: PlaceholderTeamMember[];
};

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onProjectDetailsChanged: (callback: (data: { projectId: string; details: ProjectDetailsData | null }) => void) => void;
      removeProjectDetailsChangedListener: (callback: (data: { projectId: string; details: ProjectDetailsData | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let currentProjectDetailsSnapshot: ProjectDetailsData | null = null;
let activeProjectId: string | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): ProjectDetailsData | null {
  return currentProjectDetailsSnapshot;
}

export function getActiveProjectId(): string | null {
  return activeProjectId;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener, though it's global here
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleProjectDetailsChanged(data: { projectId: string; details: ProjectDetailsData | null }): void {
  console.log("project-details-store: Received project details update via IPC", data);
  if (data.projectId === activeProjectId) {
    currentProjectDetailsSnapshot = data.details || null;
    emitChange();
  }
}

// Call this function from the UI or hook when needing to load/change the active project
export async function loadProjectDetails(projectId: string | null): Promise<void> {
  if (!projectId) {
    console.log("project-details-store: Project ID is null, clearing details.");
    activeProjectId = null;
    currentProjectDetailsSnapshot = null;
    emitChange();
    return;
  }

  if (activeProjectId === projectId && currentProjectDetailsSnapshot !== null) {
    console.log(`project-details-store: Details for project ${projectId} already loaded.`);
    // Optionally, re-fetch or just emit change if data could be stale but not forced by IPC
    // emitChange();
    return;
  }

  console.log(`project-details-store: Loading details for project ${projectId}...`);
  activeProjectId = projectId;
  currentProjectDetailsSnapshot = null; // Clear previous project's details
  emitChange(); // Notify that loading has started (details are null)

  if (window.api?.invoke) {
    try {
      const details = await window.api.invoke("query:get-project-details", { projectId }) as ProjectDetailsData | null;
      console.log(`project-details-store: Initial details for project ${projectId} fetched:`, details);
      // Ensure the project ID hasn't changed again while fetching
      if(activeProjectId === projectId) {
        currentProjectDetailsSnapshot = details || null;
      }
    } catch (error) {
      console.error(`project-details-store: Failed to initialize project details for ${projectId}:`, error);
      if(activeProjectId === projectId) {
        currentProjectDetailsSnapshot = null;
      }
    }
  } else {
    console.warn("project-details-store: window.api.invoke is not available.");
    if(activeProjectId === projectId) {
      currentProjectDetailsSnapshot = null;
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

// Initialize the global listener when the module loads.
// Actual data loading will be triggered by calling loadProjectDetails.
initializeGlobalListener();
