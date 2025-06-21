import type { PlaceholderActivity } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onUserActivityChanged: (callback: (activities: PlaceholderActivity[]) => void) => void;
      removeUserActivityChangedListener: (callback: (activities: PlaceholderActivity[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let userActivitySnapshot: PlaceholderActivity[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): PlaceholderActivity[] {
  return userActivitySnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeUserActivityChangedListener) {
    //   window.electronAPI.removeUserActivityChangedListener(handleUserActivityChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleUserActivityChanged(newActivities: PlaceholderActivity[]): void {
  console.log("user-activity-store: Received user activity update via IPC", newActivities);
  userActivitySnapshot = newActivities || [];
  emitChange();
}

let storeInitialized = false;

export async function initializeUserActivityStore(): Promise<void> {
  if (storeInitialized) {
    console.log("User Activity store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing User Activity store...");

  if (window.api?.invoke) {
    try {
      const activities = await window.api.invoke("query:get-user-activity") as PlaceholderActivity[] | null;
      console.log("user-activity-store: Initial user activities fetched:", activities);
      userActivitySnapshot = activities || [];
    } catch (error) {
      console.error("user-activity-store: Failed to initialize user activity store:", error);
      userActivitySnapshot = [];
    }
  } else {
    console.warn("user-activity-store: window.api.invoke is not available.");
    userActivitySnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onUserActivityChanged) {
    window.electronAPI.onUserActivityChanged(handleUserActivityChanged);
    console.log("user-activity-store: Subscribed to user activity changes via IPC.");
  } else {
    console.warn("user-activity-store: window.electronAPI.onUserActivityChanged is not available.");
  }
}

initializeUserActivityStore();
