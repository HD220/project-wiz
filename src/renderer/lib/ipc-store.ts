import { useSyncExternalStore } from "react";

/**
 * Creates a reactive IPC store using useSyncExternalStore
 * Subscribes to EventBus patterns and re-fetches data when events match
 *
 * @param pattern - EventBus pattern to listen for (e.g., "user:*", "project:created")
 * @param fetchFn - Function to fetch fresh data when events occur
 * @param initial - Initial state value
 * @returns Hook function that returns current state
 *
 * @example
 * ```typescript
 * const useUserList = createIpcStore("user:*",
 *   () => window.api.user.list(),
 *   []
 * );
 *
 * const useProjectList = createIpcStore("project:*",
 *   () => window.api.project.list(),
 *   []
 * );
 *
 * function Component() {
 *   const users = useUserList(); // Auto-updates on user:created, user:updated, etc.
 *   const projects = useProjectList(); // Auto-updates on project:created, etc.
 *   return <div>{users.length} users, {projects.length} projects</div>;
 * }
 * ```
 */
export function createIpcStore<T>(
  pattern: string,
  _fetchFn: () => Promise<T>,
  initial: T,
) {
  let state = initial;
  let isInitialized = false;
  const listeners = new Set<() => void>();

  // Listen for events that match the pattern (once)
  if (!isInitialized) {
    // Use window.events instead of api.event.register
    window.events.on(pattern, async () => {
      try {
        state = await _fetchFn();
        listeners.forEach((listener) => listener());
      } catch (error) {
        console.error(`Error refreshing store for pattern ${pattern}:`, error);
      }
    });

    isInitialized = true;
  }

  return () =>
    useSyncExternalStore(
      (callback) => {
        listeners.add(callback);
        return () => {
          listeners.delete(callback);
        };
      },
      () => state,
      () => initial,
    );
}
