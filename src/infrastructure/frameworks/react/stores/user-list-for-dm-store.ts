import type { UserPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onUserListForDMChanged: (callback: (users: UserPlaceholder[]) => void) => void;
      removeUserListForDMChangedListener: (callback: (users: UserPlaceholder[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let userListForDMSnapshot: UserPlaceholder[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): UserPlaceholder[] {
  return userListForDMSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeUserListForDMChangedListener) {
    //   window.electronAPI.removeUserListForDMChangedListener(handleUserListForDMChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleUserListForDMChanged(newUsers: UserPlaceholder[]): void {
  console.log("user-list-for-dm-store: Received user list for DM update via IPC", newUsers);
  userListForDMSnapshot = newUsers || [];
  emitChange();
}

let storeInitialized = false;

export async function initializeUserListForDMStore(): Promise<void> {
  if (storeInitialized) {
    console.log("User List for DM store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing User List for DM store...");

  if (window.api?.invoke) {
    try {
      const users = await window.api.invoke("query:get-user-list-for-dm") as UserPlaceholder[] | null;
      console.log("user-list-for-dm-store: Initial user list for DM fetched:", users);
      userListForDMSnapshot = users || [];
    } catch (error) {
      console.error("user-list-for-dm-store: Failed to initialize user list for DM store:", error);
      userListForDMSnapshot = [];
    }
  } else {
    console.warn("user-list-for-dm-store: window.api.invoke is not available.");
    userListForDMSnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onUserListForDMChanged) {
    window.electronAPI.onUserListForDMChanged(handleUserListForDMChanged);
    console.log("user-list-for-dm-store: Subscribed to user list for DM changes via IPC.");
  } else {
    console.warn("user-list-for-dm-store: window.electronAPI.onUserListForDMChanged is not available.");
  }
}

initializeUserListForDMStore();
