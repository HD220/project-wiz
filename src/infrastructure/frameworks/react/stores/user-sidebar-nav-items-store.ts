import type { UserSidebarNavItemPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onUserSidebarNavItemsChanged: (callback: (navItems: UserSidebarNavItemPlaceholder[]) => void) => void;
      removeUserSidebarNavItemsChangedListener: (callback: (navItems: UserSidebarNavItemPlaceholder[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let userSidebarNavItemsSnapshot: UserSidebarNavItemPlaceholder[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): UserSidebarNavItemPlaceholder[] {
  return userSidebarNavItemsSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeUserSidebarNavItemsChangedListener) {
    //   window.electronAPI.removeUserSidebarNavItemsChangedListener(handleUserSidebarNavItemsChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleUserSidebarNavItemsChanged(newNavItems: UserSidebarNavItemPlaceholder[]): void {
  console.log("user-sidebar-nav-items-store: Received user sidebar nav items update via IPC", newNavItems);
  userSidebarNavItemsSnapshot = newNavItems || [];
  emitChange();
}

let storeInitialized = false;

export async function initializeUserSidebarNavItemsStore(): Promise<void> {
  if (storeInitialized) {
    console.log("User Sidebar Nav Items store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing User Sidebar Nav Items store...");

  if (window.api?.invoke) {
    try {
      const navItems = await window.api.invoke("query:get-user-sidebar-nav-items") as UserSidebarNavItemPlaceholder[] | null;
      console.log("user-sidebar-nav-items-store: Initial user sidebar nav items fetched:", navItems);
      userSidebarNavItemsSnapshot = navItems || [];
    } catch (error) {
      console.error("user-sidebar-nav-items-store: Failed to initialize user sidebar nav items store:", error);
      userSidebarNavItemsSnapshot = [];
    }
  } else {
    console.warn("user-sidebar-nav-items-store: window.api.invoke is not available.");
    userSidebarNavItemsSnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onUserSidebarNavItemsChanged) {
    window.electronAPI.onUserSidebarNavItemsChanged(handleUserSidebarNavItemsChanged);
    console.log("user-sidebar-nav-items-store: Subscribed to user sidebar nav items changes via IPC.");
  } else {
    console.warn("user-sidebar-nav-items-store: window.electronAPI.onUserSidebarNavItemsChanged is not available.");
  }
}

initializeUserSidebarNavItemsStore();
