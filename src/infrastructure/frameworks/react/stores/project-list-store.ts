import type { ProjectType } from "@/types/project";

// Ensure global Window interface is augmented if not already in a global .d.ts file.
// This was also done in user-data-store.ts. For this subtask, we ensure the
// project list specific methods are covered. Ideally, a single, comprehensive
// window augmentation exists in a .d.ts file.
declare global {
  interface Window {
    electronAPI?: {
      // From user-data-store setup (assuming it's also needed or for completeness)
      onUserDataChanged: (callback: (userData: any) => void) => void;
      removeUserDataChangedListener: (callback: (userData: any) => void) => void;

      // New for project list
      onProjectListChanged: (callback: (projectList: ProjectType[]) => void) => void;
      removeProjectListChangedListener: (callback: (projectList: ProjectType[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let projectListSnapshot: ProjectType[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): ProjectType[] {
  return projectListSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener if no subscribers left
    // if (listeners.size === 0 && window.electronAPI?.removeProjectListChangedListener) {
    //   window.electronAPI.removeProjectListChangedListener(handleProjectListChanged);
    //   console.log("Project list listener removed as no more subscribers in store.");
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleProjectListChanged(newProjectList: ProjectType[]): void {
  console.log("project-list-store: Received project list update via IPC", newProjectList);
  projectListSnapshot = newProjectList || []; // Ensure it's an array
  emitChange();
}

let storeInitialized = false;

export async function initializeProjectListStore(): Promise<void> {
  if (storeInitialized) {
    console.log("Project list store already initialized or initialization in progress.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing project list store...");

  if (window.api?.invoke) {
    try {
      // TODO: Developer needs to implement "query:get-projects" in the Electron main process
      // This query should return ProjectType[] or null/throw.
      const projects = await window.api.invoke("query:get-projects") as ProjectType[] | null;
      console.log("project-list-store: Initial project list fetched:", projects);
      projectListSnapshot = projects || []; // Ensure it's an array, even if null is returned
    } catch (error) {
      console.error("project-list-store: Failed to initialize project list store:", error);
      projectListSnapshot = []; // Default to empty array on error
    }
  } else {
    console.warn("project-list-store: window.api.invoke is not available. Cannot fetch initial project list.");
    projectListSnapshot = []; // Default to empty array if API is not available
  }

  emitChange(); // Notify subscribers about the initial state

  // Setup IPC listener for ongoing changes
  if (window.electronAPI?.onProjectListChanged) {
    window.electronAPI.onProjectListChanged(handleProjectListChanged);
    console.log("project-list-store: Subscribed to project list changes via IPC.");
  } else {
    console.warn("project-list-store: window.electronAPI.onProjectListChanged is not available. Real-time updates for project list disabled.");
  }
}

// Initialize the store when the module loads.
initializeProjectListStore();
