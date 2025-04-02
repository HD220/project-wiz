import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("llama", {});
