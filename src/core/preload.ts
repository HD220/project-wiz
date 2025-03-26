import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { ElectronAPI } from "./electronAPI";

const electronAPI: ElectronAPI = {};

contextBridge.exposeInMainWorld("electronAPI", {
  ...electronAPI,
});
