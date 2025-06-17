import { useSyncExternalStore } from 'react';
import {
    subscribe,
    getSnapshot
} from '@/infrastructure/frameworks/react/stores/direct-messages-store';
import type { DirectMessagesState } from '@/infrastructure/frameworks/react/stores/direct-messages-store';

/**
 * Hook to get the messages for the active chat thread, loading state, and active thread ID.
 * Data is updated in real-time if the store receives IPC events for the active thread.
 *
 * To load or change the chat thread, import and call `loadMessagesForThread(threadId)`
 * from `@/infrastructure/frameworks/react/stores/direct-messages-store` directly in your component.
 */
export function useSyncedDirectMessages(): DirectMessagesState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
