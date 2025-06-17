import type { ProjectNavItemPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onProjectNavItemsChanged: (callback: (data: { projectId: string; navItems: ProjectNavItemPlaceholder[] | null }) => void) => void;
      removeProjectNavItemsChangedListener: (callback: (data: { projectId: string; navItems: ProjectNavItemPlaceholder[] | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let currentNavItemsSnapshot: ProjectNavItemPlaceholder[] | null = null;
let activeProjectIdForNav: string | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): ProjectNavItemPlaceholder[] | null {
  return currentNavItemsSnapshot;
}

export function getActiveProjectIdForNav(): string | null {
  return activeProjectIdForNav;
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

function handleProjectNavItemsChanged(data: { projectId: string; navItems: ProjectNavItemPlaceholder[] | null }): void {
  console.log("project-nav-items-store: Received project nav items update via IPC", data);
  if (data.projectId === activeProjectIdForNav) {
    currentNavItemsSnapshot = data.navItems || []; // Ensure array or null
    emitChange();
  }
}

export async function loadNavItemsForProject(projectId: string | null): Promise<void> {
  if (!projectId) {
    console.log("project-nav-items-store: Project ID is null, clearing nav items.");
    activeProjectIdForNav = null;
    currentNavItemsSnapshot = null;
    emitChange();
    return;
  }

  if (activeProjectIdForNav === projectId && currentNavItemsSnapshot !== null) {
    console.log(`project-nav-items-store: Nav items for project ${projectId} already loaded.`);
    return;
  }

  console.log(`project-nav-items-store: Loading nav items for project ${projectId}...`);
  activeProjectIdForNav = projectId;
  currentNavItemsSnapshot = null;
  emitChange();

  if (window.api?.invoke) {
    try {
      const navItems = await window.api.invoke("query:get-project-nav-items", { projectId }) as ProjectNavItemPlaceholder[] | null;
      console.log(`project-nav-items-store: Initial nav items for project ${projectId} fetched:`, navItems);
      if(activeProjectIdForNav === projectId) {
        currentNavItemsSnapshot = navItems || [];
      }
    } catch (error) {
      console.error(`project-nav-items-store: Failed to initialize nav items for ${projectId}:`, error);
      if(activeProjectIdForNav === projectId) {
        currentNavItemsSnapshot = null;
      }
    }
  } else {
    console.warn("project-nav-items-store: window.api.invoke is not available.");
    if(activeProjectIdForNav === projectId) {
      currentNavItemsSnapshot = null;
    }
  }
  emitChange();
}

let ipcListenerInitialized = false;
function initializeGlobalListener(): void {
    if (ipcListenerInitialized) return;
    if (window.electronAPI?.onProjectNavItemsChanged) {
        window.electronAPI.onProjectNavItemsChanged(handleProjectNavItemsChanged);
        console.log("project-nav-items-store: Subscribed to project nav items changes via IPC.");
        ipcListenerInitialized = true;
    } else {
        console.warn("project-nav-items-store: window.electronAPI.onProjectNavItemsChanged is not available.");
    }
}

initializeGlobalListener();
