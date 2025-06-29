import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define a type for the exposed Electron IPC API
export interface ElectronIPC {
  invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => () => void; // Returns an unsubscribe function
  send: (channel: string, ...args: any[]) => void;
  removeAllListeners: (channel: string) => void;
}

const electronIPC: ElectronIPC = {
  invoke: <T = any>(channel: string, ...args: any[]): Promise<T> => {
    return ipcRenderer.invoke(channel, ...args);
  },

  /**
   * Subscribes to an IPC channel.
   * @param channel The channel to subscribe to.
   * @param listener The function to call when an event is received on the channel.
   * @returns A function to unsubscribe the listener from the channel.
   */
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): (() => void) => {
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  send: (channel: string, ...args: any[]): void => {
    ipcRenderer.send(channel, ...args);
  },

  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  }
};

// Expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld('electronIPC', electronIPC);
  console.log('[Preload] electronIPC exposed successfully.');
} catch (error) {
  console.error('[Preload] Failed to expose electronIPC:', error);
}

// For renderer to know its environment (optional but can be useful)
// contextBridge.exposeInMainWorld('electronEnv', {
//   NODE_ENV: process.env.NODE_ENV, // Will be undefined unless explicitly set for preload by build tool
//   platform: process.platform,
// });

// Ensure contextIsolation is true in BrowserWindow webPreferences.
// The path to this preload script (after bundling) must be correctly set
// in webPreferences.preload. Electron Forge with Vite plugin usually handles this
// via a constant like MAIN_WINDOW_PRELOAD_VITE_ENTRY.
// Example webPreferences in main.ts:
// webPreferences: {
//   preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY,
//   contextIsolation: true,
//   nodeIntegration: false,
//   sandbox: true, // Recommended to keep true if possible
// },
// The console.log above will appear in the Renderer's DevTools if preload is loaded.
// If process.env.NODE_ENV is needed, it must be passed during build time to preload,
// as preload runs in a semi-renderer context without full Node.js process.env access by default.
// Vite's `define` config can be used for this: `define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }`
// in vite.preload.config.mts.
// However, for just exposing IPC, this is not strictly necessary.
// The `platform` can be exposed if needed by UI for platform-specific logic.
// For now, only electronIPC is exposed.
