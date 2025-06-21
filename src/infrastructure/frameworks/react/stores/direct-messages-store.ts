import type { PlaceholderChatMessage } from '@/infrastructure/frameworks/react/lib/placeholders';

export type DirectMessagesState = {
  messages: PlaceholderChatMessage[] | null;
  isLoading: boolean;
  activeThreadId: string | null;
};

// Augment Window interface (assuming it's correctly defined for onDirectMessagesChanged and api.invoke)
declare global {
  interface Window {
    electronAPI?: {
      onDirectMessagesChanged: (callback: (data: { threadId: string; messages: PlaceholderChatMessage[] | null }) => void) => void;
      removeDirectMessagesChangedListener: (callback: (data: { threadId: string; messages: PlaceholderChatMessage[] | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let storeState: DirectMessagesState = {
  messages: null,
  isLoading: false,
  activeThreadId: null,
};

const listeners = new Set<() => void>();

export function getSnapshot(): DirectMessagesState {
  return storeState;
}

// getActiveThreadId can be removed
// export function getActiveThreadId(): string | null {
//   return storeState.activeThreadId;
// }

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

function handleDirectMessagesChanged(data: { threadId: string; messages: PlaceholderChatMessage[] | null }): void {
  console.log("direct-messages-store: Received DMs update via IPC", data);
  if (data.threadId === storeState.activeThreadId) {
    storeState.messages = data.messages || []; // Ensure array or null
    storeState.isLoading = false; // Assume IPC update means loading is done
    emitChange();
  }
}

export async function loadMessagesForThread(threadId: string | null): Promise<void> {
  if (!threadId) {
    console.log("direct-messages-store: Thread ID is null, clearing messages.");
    storeState.activeThreadId = null;
    storeState.messages = null;
    storeState.isLoading = false;
    emitChange();
    return;
  }

  // if (storeState.activeThreadId === threadId && storeState.messages !== null && !storeState.isLoading) {
  //   console.log(`direct-messages-store: Messages for thread ${threadId} already loaded.`);
  //   return;
  // }

  console.log(`direct-messages-store: Loading messages for thread ${threadId}...`);
  storeState.activeThreadId = threadId;
  storeState.messages = null;
  storeState.isLoading = true;
  emitChange();

  if (window.api?.invoke) {
    try {
      const messages = await window.api.invoke("query:get-direct-messages", { threadId }) as PlaceholderChatMessage[] | null;
      console.log(`direct-messages-store: Initial messages for thread ${threadId} fetched:`, messages);
      if (storeState.activeThreadId === threadId) {
        storeState.messages = messages || [];
      }
    } catch (error) {
      console.error(`direct-messages-store: Failed to initialize messages for thread ${threadId}:`, error);
      if (storeState.activeThreadId === threadId) {
        storeState.messages = null;
      }
    } finally {
      if (storeState.activeThreadId === threadId) {
        storeState.isLoading = false;
      }
    }
  } else {
    console.warn("direct-messages-store: window.api.invoke is not available.");
    if (storeState.activeThreadId === threadId) {
      storeState.messages = null;
      storeState.isLoading = false;
    }
  }
  emitChange();
}

let ipcListenerInitialized = false;
function initializeGlobalListener(): void {
    if (ipcListenerInitialized) return;
    if (window.electronAPI?.onDirectMessagesChanged) {
        window.electronAPI.onDirectMessagesChanged(handleDirectMessagesChanged);
        console.log("direct-messages-store: Subscribed to direct message changes via IPC.");
        ipcListenerInitialized = true;
    } else {
        console.warn("direct-messages-store: window.electronAPI.onDirectMessagesChanged is not available.");
    }
}

initializeGlobalListener();
