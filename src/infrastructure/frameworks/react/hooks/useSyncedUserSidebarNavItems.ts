import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/infrastructure/frameworks/react/stores/user-sidebar-nav-items-store'; // Adjusted path
import type { UserSidebarNavItemPlaceholder } from '@/infrastructure/frameworks/react/lib/placeholders'; // Adjusted path

/**
 * Hook to get the current user sidebar nav items, updated in real-time via IPC events
 * from the Electron main process.
 */
export function useSyncedUserSidebarNavItems(): UserSidebarNavItemPlaceholder[] {
  const navItems = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return navItems || [];
}
