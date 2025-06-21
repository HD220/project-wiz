import type { ProjectNavItemPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders';

export type ProjectNavItemsState = {
  navItems: ProjectNavItemPlaceholder[] | null;
  isLoading: boolean;
  activeProjectIdForNav: string | null;
};

// Augment Window interface (assuming it's correctly defined for onProjectNavItemsChanged and api.invoke)
declare global {
  interface Window {
    electronAPI?: {
      onProjectNavItemsChanged: (callback: (data: { projectId: string; navItems: ProjectNavItemPlaceholder[] | null }) => void) => void;
      removeProjectNavItemsChangedListener: (callback: (data: { projectId: string; navItems: ProjectNavItemPlaceholder[] | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let storeState: ProjectNavItemsState = {
  navItems: null,
  isLoading: false,
  activeProjectIdForNav: null,
};

const listeners = new Set<() => void>();

export function getSnapshot(): ProjectNavItemsState {
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

function handleProjectNavItemsChanged(data: { projectId: string; navItems: ProjectNavItemPlaceholder[] | null }): void {
  console.log("project-nav-items-store: Received project nav items update via IPC", data);
  if (data.projectId === storeState.activeProjectIdForNav) {
    storeState.navItems = data.navItems || []; // Ensure array or null
    storeState.isLoading = false; // Assume IPC update means loading is done
    emitChange();
  }
}

export async function loadNavItemsForProject(projectId: string | null): Promise<void> {
  if (!projectId) {
    console.log("project-nav-items-store: Project ID is null, clearing nav items.");
    storeState.activeProjectIdForNav = null;
    storeState.navItems = null;
    storeState.isLoading = false;
    emitChange();
    return;
  }

  // if (storeState.activeProjectIdForNav === projectId && storeState.navItems !== null && !storeState.isLoading) {
  //   console.log(`project-nav-items-store: Nav items for project ${projectId} already loaded.`);
  //   return;
  // }

  console.log(`project-nav-items-store: Loading nav items for project ${projectId}...`);
  storeState.activeProjectIdForNav = projectId;
  storeState.navItems = null;
  storeState.isLoading = true;
  emitChange();

  if (window.api?.invoke) {
    try {
      const navItems = await window.api.invoke("query:get-project-nav-items", { projectId }) as ProjectNavItemPlaceholder[] | null;
      console.log(`project-nav-items-store: Initial nav items for project ${projectId} fetched:`, navItems);
      if (storeState.activeProjectIdForNav === projectId) {
        storeState.navItems = navItems || [];
      }
    } catch (error) {
      console.error(`project-nav-items-store: Failed to initialize nav items for ${projectId}:`, error);
      if (storeState.activeProjectIdForNav === projectId) {
        storeState.navItems = null;
      }
    } finally {
      if (storeState.activeProjectIdForNav === projectId) {
        storeState.isLoading = false;
      }
    }
  } else {
    console.warn("project-nav-items-store: window.api.invoke is not available.");
    if (storeState.activeProjectIdForNav === projectId) {
      storeState.navItems = null;
      storeState.isLoading = false;
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
