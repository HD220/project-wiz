import type { UserQueryOutput } from '@/core/application/queries/user.query'; // Assuming this path is correct

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      onUserDataChanged: (callback: (userData: UserQueryOutput | null) => void) => void;
      removeUserDataChangedListener: (callback: (userData: UserQueryOutput | null) => void) => void;
      // Include other listeners if they were part of a combined declaration, like onProjectListChanged
      onProjectListChanged?: (callback: (projectList: any[]) => void) => void; // Placeholder for other listeners
      removeProjectListChangedListener?: (callback: (projectList: any[]) => void) => void; // Placeholder
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let currentUserSnapshot: UserQueryOutput | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): UserQueryOutput | null {
  return currentUserSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener if no subscribers left
    // if (listeners.size === 0 && window.electronAPI?.removeUserDataChangedListener) {
    //   window.electronAPI.removeUserDataChangedListener(handleUserDataChanged);
    //   console.log("User data listener removed as no more subscribers in store.");
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleUserDataChanged(newUserData: UserQueryOutput | null): void {
  console.log("user-data-store: Received user data update via IPC", newUserData);
  currentUserSnapshot = newUserData;
  emitChange();
}

let storeInitialized = false;

export async function initializeUserDataStore(): Promise<void> {
  if (storeInitialized) {
    console.log("User data store already initialized or initialization in progress.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing user data store...");

  if (window.api?.invoke) {
    try {
      // Assuming "query:get-user-data" is the correct channel for fetching initial user data
      const userData = await window.api.invoke("query:get-user-data") as UserQueryOutput | null;
      console.log("user-data-store: Initial user data fetched:", userData);
      currentUserSnapshot = userData;
    } catch (error) {
      console.error("user-data-store: Failed to initialize user data store:", error);
      currentUserSnapshot = null; // Default to null on error
    }
  } else {
    console.warn("user-data-store: window.api.invoke is not available. Cannot fetch initial user data.");
    currentUserSnapshot = null; // Default to null if API is not available
  }

  emitChange(); // Notify subscribers about the initial state

  // Setup IPC listener for ongoing changes
  if (window.electronAPI?.onUserDataChanged) {
    window.electronAPI.onUserDataChanged(handleUserDataChanged);
    console.log("user-data-store: Subscribed to user data changes via IPC.");
  } else {
    console.warn("user-data-store: window.electronAPI.onUserDataChanged is not available. Real-time updates for user data disabled.");
  }
}

// Initialize the store when the module loads.
initializeUserDataStore();
