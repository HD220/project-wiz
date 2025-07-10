import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Define a type for the exposed Electron IPC API
import { IpcContracts } from "@/shared/ipc-types/ipc-contracts";

export interface IElectronIPC {
  invoke: <Channel extends keyof IpcContracts>(
    channel: Channel,
    ...args: IpcContracts[Channel]["request"] extends void
      ? []
      : [IpcContracts[Channel]["request"]]
  ) => Promise<IpcContracts[Channel]["response"]>;
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => () => void;
  send: (channel: string, ...args: unknown[]) => void;
  removeAllListeners: (channel: string) => void;
}

const electronIPC: IElectronIPC = {
  invoke: <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
    return ipcRenderer.invoke(channel, ...args);
  },

  /**
   * Subscribes to an IPC channel.
   * @param channel The channel to subscribe to.
   * @param listener The function to call when an event is received on the channel.
   * @returns A function to unsubscribe the listener from the channel.
   */
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ): (() => void) => {
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  send: (channel: string, ...args: unknown[]): void => {
    ipcRenderer.send(channel, ...args);
  },

  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// Expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld("electronIPC", electronIPC);
  console.log("[Preload] electronIPC exposed successfully.");
} catch (error) {
  console.error("[Preload] Failed to expose electronIPC:", error);
}
