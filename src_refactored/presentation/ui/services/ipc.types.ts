// src_refactored/presentation/ui/services/ipc.types.ts

/**
 * Defines the structure of the API exposed by Electron's preload script
 * to the renderer process for IPC communication.
 */
export interface IElectronIPC {
  /**
   * Sends a message to the main process via `ipcRenderer.invoke` and returns a Promise
   * that resolves with the response from the main process.
   * @param channel The IPC channel to invoke.
   * @param args Arguments to send to the main process.
   * @returns A Promise that resolves with the result from the IPC handler.
   */
  invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;

  /**
   * Subscribes to an IPC channel for messages sent from the main process.
   * @param channel The IPC channel to listen on.
   * @param listener The function to call with messages from the main process.
   *                 The listener receives `(event, ...args)`.
   * @returns A function to unsubscribe the listener from the channel.
   */
  on: (channel: string, listener: (...args: any[]) => void) => () => void;

  /**
   * Sends a message to the main process via `ipcRenderer.send`. This is typically
   * for one-way communication where no response is expected.
   * @param channel The IPC channel to send the message on.
   * @param args Arguments to send to the main process.
   */
  send: (channel: string, ...args: any[]) => void;

  /**
   * Removes a specific listener for an IPC channel.
   * Note: This is less commonly exposed directly if `on` returns an unsubscribe function.
   * However, including it for completeness based on some preload patterns.
   * If `on` returns an unsubscribe function, that's generally preferred.
   * @param channel The IPC channel.
   * @param listener The exact listener function that was subscribed.
   */
  removeListener?: (channel: string, listener: (...args: any[]) => void) => void;

  /**
   * Removes all listeners for a specific IPC channel.
   * @param channel The IPC channel.
   */
  removeAllListeners?: (channel: string) => void;
}

/**
 * It's common to expose the IPC API under a specific key on the window object.
 * This declares that key for TypeScript.
 */
declare global {
  interface Window {
    electronIPC?: IElectronIPC; // Or 'api', 'coreAPI', etc. Matching the preload script.
                                // Using 'electronIPC' as a placeholder name for the refactored version.
  }
}

// It's also useful to define known IPC channel names.
// These would ideally be shared between main, preload, and renderer.
// For now, this is a placeholder. These should be based on actual use cases and main process handlers.
// Example:
// export enum IPCChannel {
//   GET_APP_VERSION = 'app:get-version',
//   CREATE_PROJECT = 'project:create',
//   // ... other channels
// }

// Placeholder for IPC result structure, can be expanded.
export interface IPCResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    name?: string;
    stack?: string;
  };
}
