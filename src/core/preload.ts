// Preload script for Electron.
// Exposes a secure API to the renderer process following the client's updated coding rules.
// Not using JSDoc comments since the project already uses strict TypeScript typing and such comments are only used for very complex functions.

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { ElectronAPI } from "./electronAPI";

const electronAPI: ElectronAPI = {
  onDownloadProgress(callback) {
    const listener = (event: IpcRendererEvent, data: any) => {
      // console.log("evento recebido do main");
      callback(data);
    };

    ipcRenderer.on("llm:download-progress", listener);

    return () => ipcRenderer.off("llm:download-progress", listener);
  },
  onLoadProgress(callback) {
    const listener = (event: IpcRendererEvent, data: any) => {
      callback(data);
    };

    ipcRenderer.on("llm:load-progress", listener);

    return () => ipcRenderer.off("llm:load-progress", listener);
  },
  // run: (text: string) => {
  //   console.log("sending message from preload", text);
  //   ipcRenderer.send("llm:run", text);
  // },
  // onResponse: (callback: (response: string) => void) => {
  //   ipcRenderer.on(
  //     "llm:response",
  //     (event: IpcRendererEvent, response: string) => {
  //       callback(response);
  //     }
  //   );
  // },
  // onError: (callback: (error: string) => void) => {
  //   ipcRenderer.on("llm:error", (event: IpcRendererEvent, error: string) => {
  //     callback(error);
  //   });
  // },
  // onStateChange: (callback: (state: string) => void) => {
  //   ipcRenderer.on(
  //     "llm:stateChange",
  //     (event: IpcRendererEvent, state: string) => {
  //       callback(state);
  //     }
  //   );
  // },
  // onTextChunk: (callback: (text: string) => void) => {
  //   ipcRenderer.on("llm:textChunk", (event: IpcRendererEvent, text: string) => {
  //     callback(text);
  //   });
  // },
};

// Expose the API securely to the renderer's global window object.
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
