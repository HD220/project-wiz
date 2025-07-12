import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Define a type for the exposed Electron IPC API

export interface IElectronIPC {
  invoke: <Channel, Payload, Response>(
    channel: Channel,
    ...args: Payload[]
  ) => Promise<Response>;
  on: (
    channel: string,
    listener: <EventResponse>(
      event: IpcRendererEvent,
      ...args: EventResponse[]
    ) => void,
  ) => () => void;
  send: <Channel, Payload>(channel: Channel, ...args: Payload[]) => void;
  removeAllListeners: <Channel>(channel: Channel) => void;
  // Window control functions
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
}

const electronIPC: IElectronIPC = {
  invoke: function <Channel, Payload, Response>(
    channel: Channel,
    ...args: Payload[]
  ): Promise<Response> {
    throw new Error("Function not implemented.");
  },
  on: function (
    channel: string,
    listener: <EventResponse>(
      event: IpcRendererEvent,
      ...args: EventResponse[]
    ) => void,
  ): () => void {
    throw new Error("Function not implemented.");
  },
  send: function <Channel, Payload>(
    channel: Channel,
    ...args: Payload[]
  ): void {
    throw new Error("Function not implemented.");
  },
  removeAllListeners: function <Channel>(channel: Channel): void {
    throw new Error("Function not implemented.");
  },

  // Window control functions
  windowMinimize: (): Promise<void> => {
    return ipcRenderer.invoke("window-minimize");
  },

  windowMaximize: (): Promise<void> => {
    return ipcRenderer.invoke("window-maximize");
  },

  windowClose: (): Promise<void> => {
    return ipcRenderer.invoke("window-close");
  },

  windowIsMaximized: (): Promise<boolean> => {
    return ipcRenderer.invoke("window-is-maximized");
  },
};

// Expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld("electronIPC", electronIPC);
  console.log("[Preload] electronIPC exposed successfully.");
} catch (error) {
  console.error("[Preload] Failed to expose electronIPC:", error);
}
