import type { LLMProviderPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

// Augment Window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // ... other existing listeners ...
      onLLMProvidersChanged: (callback: (providers: LLMProviderPlaceholder[]) => void) => void;
      removeLLMProvidersChangedListener: (callback: (providers: LLMProviderPlaceholder[]) => void) => void;
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
    };
  }
}

let llmProvidersSnapshot: LLMProviderPlaceholder[] = [];
const listeners = new Set<() => void>();

export function getSnapshot(): LLMProviderPlaceholder[] {
  return llmProvidersSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: Cleanup IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeLLMProvidersChangedListener) {
    //   window.electronAPI.removeLLMProvidersChangedListener(handleLLMProvidersChanged);
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleLLMProvidersChanged(newProviders: LLMProviderPlaceholder[]): void {
  console.log("llm-providers-store: Received LLM providers update via IPC", newProviders);
  llmProvidersSnapshot = newProviders || [];
  emitChange();
}

let storeInitialized = false;

export async function initializeLLMProvidersStore(): Promise<void> {
  if (storeInitialized) {
    console.log("LLM Providers store already initialized.");
    return;
  }
  storeInitialized = true;
  console.log("Initializing LLM Providers store...");

  if (window.api?.invoke) {
    try {
      const providers = await window.api.invoke("query:get-llm-providers") as LLMProviderPlaceholder[] | null;
      console.log("llm-providers-store: Initial LLM providers fetched:", providers);
      llmProvidersSnapshot = providers || [];
    } catch (error) {
      console.error("llm-providers-store: Failed to initialize LLM providers store:", error);
      llmProvidersSnapshot = [];
    }
  } else {
    console.warn("llm-providers-store: window.api.invoke is not available.");
    llmProvidersSnapshot = [];
  }

  emitChange();

  if (window.electronAPI?.onLLMProvidersChanged) {
    window.electronAPI.onLLMProvidersChanged(handleLLMProvidersChanged);
    console.log("llm-providers-store: Subscribed to LLM providers changes via IPC.");
  } else {
    console.warn("llm-providers-store: window.electronAPI.onLLMProvidersChanged is not available.");
  }
}

initializeLLMProvidersStore();
