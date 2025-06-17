import type { PlaceholderChatMessage } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onDirectMessagesChanged: (callback: (data: { threadId: string; messages: PlaceholderChatMessage[] | null }) => void) => void;
      removeDirectMessagesChangedListener: (callback: (data: { threadId: string; messages: PlaceholderChatMessage[] | null }) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let currentMessagesSnapshot: PlaceholderChatMessage[] | null = null;
let activeThreadId: string | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): PlaceholderChatMessage[] | null {
  return currentMessagesSnapshot;
}

export function getActiveThreadId(): string | null {
  return activeThreadId;
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

function handleDirectMessagesChanged(data: { threadId: string; messages: PlaceholderChatMessage[] | null }): void {
  console.log("direct-messages-store: Received DMs update via IPC", data);
  if (data.threadId === activeThreadId) {
    currentMessagesSnapshot = data.messages || []; // Ensure it's an array or null. Placeholder data was an array.
    emitChange();
  }
}

export async function loadMessagesForThread(threadId: string | null): Promise<void> {
  if (!threadId) {
    console.log("direct-messages-store: Thread ID is null, clearing messages.");
    activeThreadId = null;
    currentMessagesSnapshot = null;
    emitChange();
    return;
  }

  if (activeThreadId === threadId && currentMessagesSnapshot !== null) {
    console.log(`direct-messages-store: Messages for thread ${threadId} already loaded.`);
    return;
  }

  console.log(`direct-messages-store: Loading messages for thread ${threadId}...`);
  activeThreadId = threadId;
  currentMessagesSnapshot = null; // Clear previous thread's messages
  emitChange(); // Notify that loading has started

  if (window.api?.invoke) {
    try {
      const messages = await window.api.invoke("query:get-direct-messages", { threadId }) as PlaceholderChatMessage[] | null;
      console.log(`direct-messages-store: Initial messages for thread ${threadId} fetched:`, messages);
      if(activeThreadId === threadId) {
        currentMessagesSnapshot = messages || []; // Ensure it's an array or null. Placeholder data was an array.
      }
    } catch (error) {
      console.error(`direct-messages-store: Failed to initialize messages for thread ${threadId}:`, error);
      if(activeThreadId === threadId) {
        currentMessagesSnapshot = null;
      }
    }
  } else {
    console.warn("direct-messages-store: window.api.invoke is not available.");
    if(activeThreadId === threadId) {
      currentMessagesSnapshot = null;
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
