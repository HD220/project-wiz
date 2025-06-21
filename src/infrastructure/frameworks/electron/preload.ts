// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

type IpcData = Record<string, unknown>;
type IpcListener<T = IpcData> = (data?: T) => Promise<void>;

interface API {
  invoke: <T = unknown, R = unknown>(channel: string, data?: T) => Promise<R>;
  send: <T = IpcData>(channel: string, data?: T) => void;
  on: <T = IpcData>(channel: string, listener: IpcListener<T>) => () => void;
}

contextBridge.exposeInMainWorld("api", {
  async invoke<T, R>(channel: string, data?: T) {
    return (await ipcRenderer.invoke(channel, { ...data })) as R;
  },
  on<T>(channel: string, listener: IpcListener<T>) {
    const ipcListener = async (event: IpcRendererEvent, data: T) => {
      await listener({ ...data } as T);
    };
    ipcRenderer.on(channel, ipcListener);
    return () => {
      ipcRenderer.removeListener(channel, ipcListener);
    };
  },
  send<T>(channel: string, data?: T) {
    ipcRenderer.send(channel, { ...data });
  },
} as API);

declare global {
  interface Window {
    api: API;
  }
}
