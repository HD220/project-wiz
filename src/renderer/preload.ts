// Preload script for Electron
// This script has access to node.js APIs and will be executed before the renderer process loads

import { contextBridge } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // Basic API placeholder - will be expanded as IPC handlers are added
  platform: process.platform,
  version: process.versions.electron,
});

console.log("Preload script loaded successfully");
