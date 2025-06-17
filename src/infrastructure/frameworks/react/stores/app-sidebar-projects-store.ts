import type { AppSidebarProjectPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onAppSidebarProjectsChanged: (callback: (projects: AppSidebarProjectPlaceholder[]) => void) => void;
      removeAppSidebarProjectsChangedListener: (callback: (projects: AppSidebarProjectPlaceholder[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let appSidebarProjectsSnapshot: AppSidebarProjectPlaceholder[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): AppSidebarProjectPlaceholder[] {
  return appSidebarProjectsSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeAppSidebarProjectsChangedListener) {
    //   window.electronAPI.removeAppSidebarProjectsChangedListener(handleAppSidebarProjectsChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleAppSidebarProjectsChanged(newProjects: AppSidebarProjectPlaceholder[]): void {
  console.log("app-sidebar-projects-store: Received app sidebar projects update via IPC", newProjects);
  appSidebarProjectsSnapshot = newProjects || [];
  emitChange();
}

let storeInitialized = false;

export async function initializeAppSidebarProjectsStore(): Promise<void> {
  if (storeInitialized) {
    console.log("App Sidebar Projects store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing App Sidebar Projects store...");

  if (window.api?.invoke) {
    try {
      const projects = await window.api.invoke("query:get-app-sidebar-projects") as AppSidebarProjectPlaceholder[] | null;
      console.log("app-sidebar-projects-store: Initial app sidebar projects fetched:", projects);
      appSidebarProjectsSnapshot = projects || [];
    } catch (error) {
      console.error("app-sidebar-projects-store: Failed to initialize app sidebar projects store:", error);
      appSidebarProjectsSnapshot = [];
    }
  } else {
    console.warn("app-sidebar-projects-store: window.api.invoke is not available.");
    appSidebarProjectsSnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onAppSidebarProjectsChanged) {
    window.electronAPI.onAppSidebarProjectsChanged(handleAppSidebarProjectsChanged);
    console.log("app-sidebar-projects-store: Subscribed to app sidebar projects changes via IPC.");
  } else {
    console.warn("app-sidebar-projects-store: window.electronAPI.onAppSidebarProjectsChanged is not available.");
  }
}

initializeAppSidebarProjectsStore();
