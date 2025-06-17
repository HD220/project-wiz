import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/llm-providers-store'; // Adjusted path
import type { LLMProviderPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current LLM providers list, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedLLMProviders(): LLMProviderPlaceholder[] {
  const providers = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return providers || [];
}
