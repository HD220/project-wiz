// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { slugfy } from "@/core/common/utils";
import { contextBridge, ipcRenderer } from "electron";

interface API {
  invoke: <R>(channel: string, data?: any) => Promise<R>;
  send: (channel: string, data?: any) => void;
  on: (channel: string, listener: (data?: any) => Promise<void>) => () => void;
}

contextBridge.exposeInMainWorld("api", {
  async invoke(channel, data: any) {
    return await ipcRenderer.invoke(channel, { ...data });
  },
  on(channel, listener) {
    const ipcListener = async (event: any, data: any) => {
      await listener({ ...data });
    };
    ipcRenderer.on(channel, ipcListener);
    return () => {
      ipcRenderer.removeListener(channel, ipcListener);
    };
  },
  send(channel, data) {
    ipcRenderer.send(channel, { ...data });
  },
} as API);

declare global {
  interface Window {
    api: API;
  }
}
