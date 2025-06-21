import type { DirectMessageThreadPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onDirectMessageThreadsChanged: (callback: (threads: DirectMessageThreadPlaceholder[]) => void) => void;
      removeDirectMessageThreadsChangedListener: (callback: (threads: DirectMessageThreadPlaceholder[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let dmThreadsSnapshot: DirectMessageThreadPlaceholder[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): DirectMessageThreadPlaceholder[] {
  return dmThreadsSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeDirectMessageThreadsChangedListener) {
    //   window.electronAPI.removeDirectMessageThreadsChangedListener(handleDirectMessageThreadsChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleDirectMessageThreadsChanged(newThreads: DirectMessageThreadPlaceholder[]): void {
  console.log("direct-message-threads-store: Received DM threads update via IPC", newThreads);
  dmThreadsSnapshot = newThreads || [];
  emitChange();
}

let storeInitialized = false;

export async function initializeDirectMessageThreadsStore(): Promise<void> {
  if (storeInitialized) {
    console.log("DM Threads store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing DM Threads store...");

  if (window.api?.invoke) {
    try {
      const threads = await window.api.invoke("query:get-direct-message-threads") as DirectMessageThreadPlaceholder[] | null;
      console.log("direct-message-threads-store: Initial DM threads fetched:", threads);
      dmThreadsSnapshot = threads || [];
    } catch (error) {
      console.error("direct-message-threads-store: Failed to initialize DM threads store:", error);
      dmThreadsSnapshot = [];
    }
  } else {
    console.warn("direct-message-threads-store: window.api.invoke is not available.");
    dmThreadsSnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onDirectMessageThreadsChanged) {
    window.electronAPI.onDirectMessageThreadsChanged(handleDirectMessageThreadsChanged);
    console.log("direct-message-threads-store: Subscribed to DM threads changes via IPC.");
  } else {
    console.warn("direct-message-threads-store: window.electronAPI.onDirectMessageThreadsChanged is not available.");
  }
}

initializeDirectMessageThreadsStore();
