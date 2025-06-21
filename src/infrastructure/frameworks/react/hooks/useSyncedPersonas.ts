import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/personas-store'; // Adjusted path
import type { PersonaPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current personas list, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedPersonas(): PersonaPlaceholder[] {
  const personas = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return personas || [];
}
