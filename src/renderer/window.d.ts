// Window API types - module augmentations from IPC handlers are automatically included
declare global {
  interface Window {
    api: WindowAPI.API;
    events: ReactiveEvents;
  }

  /**
   * Reactive Events Bridge API
   *
   * Provides type-safe access to the reactive event system from the renderer process.
   * Used by useReactiveQuery hook to listen for data changes from the main process.
   */
  interface ReactiveEvents {
    /**
     * Register an event listener for reactive events
     *
     * @param eventName - The event name to listen for (e.g., "event:messages")
     * @param callback - Callback function to handle the event data
     * @returns Cleanup function to remove the listener
     */
    on: <T = unknown>(
      eventName: string,
      callback: (data: T) => void,
    ) => () => void;

    /**
     * Remove an event listener for reactive events
     *
     * @param eventName - The event name to stop listening for
     * @param callback - The callback function to remove
     */
    off: <T = unknown>(eventName: string, callback: (data: T) => void) => void;

    /**
     * Register a one-time event listener
     *
     * @param eventName - The event name to listen for
     * @param callback - Callback function to handle the event data
     */
    once: <T = unknown>(eventName: string, callback: (data: T) => void) => void;
  }

  namespace WindowAPI {
    interface API {
      // System information
      platform: string;
      version: string;

      // All features using new colocated IPC architecture
      auth: Auth;
      user: User;
      project: Project;
      agent: Agent;
      llmProvider: LlmProvider;
      dm: Dm;
      conversation: Conversation;
      channel: Channel;
      profile: Profile;
      window: Window;
    }
  }
}

export {};
