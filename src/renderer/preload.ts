import { contextBridge } from "electron";

import { createElectronIPC, IElectronIPC } from "./preload/electron-ipc";

const electronIPC = createElectronIPC();

exposeElectronIPC(electronIPC);

function exposeElectronIPC(api: IElectronIPC): void {
  try {
    contextBridge.exposeInMainWorld("electronIPC", api);
    console.log("[Preload] electronIPC exposed successfully.");
  } catch (error) {
    console.error("[Preload] Failed to expose electronIPC:", error);
  }
}
