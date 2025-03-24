import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { ElectronAPI, ProgressEvent } from "./electronAPI";

const validateProgressEvent = (data: unknown): data is ProgressEvent => {
  return typeof data === "object" && data !== null && "progress" in data;
};

const electronAPI: ElectronAPI = {
  onDownloadProgress(callback) {
    const listener = (event: IpcRendererEvent, data: unknown) => {
      if (validateProgressEvent(data)) {
        callback(data);
      } else {
        console.error("Invalid progress event data:", data);
      }
    };
    ipcRenderer.on("llm:download-progress", listener);
    return () => ipcRenderer.off("llm:download-progress", listener);
  },

  onLoadProgress(callback) {
    const listener = (event: IpcRendererEvent, data: unknown) => {
      if (validateProgressEvent(data)) {
        callback(data);
      } else {
        console.error("Invalid load progress event data:", data);
      }
    };
    ipcRenderer.on("llm:load-progress", listener);
    return () => ipcRenderer.off("llm:load-progress", listener);
  },

  downloadModel(modelId, onProgress) {
    if (typeof modelId !== "string") {
      return Promise.reject(new Error("Invalid modelId"));
    }

    const progressListener = (event: IpcRendererEvent, data: unknown) => {
      if (validateProgressEvent(data)) {
        onProgress(data.progress);
      } else {
        console.error("Invalid download progress data:", data);
      }
    };

    ipcRenderer.on("llm:download-progress", progressListener);

    return ipcRenderer.invoke("llm:download-model", modelId).finally(() => {
      ipcRenderer.off("llm:download-progress", progressListener);
    });
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
