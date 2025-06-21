import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/app-sidebar-projects-store'; // Adjusted path
import type { AppSidebarProjectPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current app sidebar projects list, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedAppSidebarProjects(): AppSidebarProjectPlaceholder[] {
  const projects = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return projects || [];
}
