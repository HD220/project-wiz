// Path: src/electron/preload.ts - THIS FILE MAY BE REGENERATED/UPDATED BY SUBTASKS
// It assumes the primary purpose is to expose the 'api' object via contextBridge.
// If other preload logic existed, it needs to be manually re-integrated.

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Define a more specific type for callbacks if possible, or use any for flexibility
type GenericCallback = (data: any) => void;
type ProjectListCallback = (projectList: any[]) => void; // projectList will be ProjectType[] in renderer

contextBridge.exposeInMainWorld("api", {
  /**
   * Generic utility to call an IPC handler in the main process and return a Promise.
   * @param channel The IPC channel to invoke.
   * @param data The data to send to the IPC handler.
   * @returns A Promise that resolves with the result from the IPC handler.
   */
  invoke: (channel: string, data?: any): Promise<any> => {
    return ipcRenderer.invoke(channel, data);
  },

  // --- User Data Listeners ---
  /**
   * Subscribes to user data changes from the main process.
   * @param callback Function to call with the new user data.
   */
  onUserDataChanged: (callback: GenericCallback): void => {
    const handler = (_event: IpcRendererEvent, userData: any) => callback(userData);
    ipcRenderer.on("ipc:user-data-changed", handler);
  },

  /**
   * Removes a previously subscribed listener for user data changes.
   * @param callback The exact callback function that was used to subscribe.
   */
  removeUserDataChangedListener: (callback: GenericCallback): void => {
    ipcRenderer.removeListener("ipc:user-data-changed", callback);
  },

  // --- Project List Listeners ---
  /**
   * Subscribes to project list changes from the main process.
   * @param callback Function to call with the new project list (ProjectType[]).
   */
  onProjectListChanged: (callback: ProjectListCallback): void => {
    const handler = (_event: IpcRendererEvent, projectList: any[]) => callback(projectList);
    ipcRenderer.on("ipc:project-list-changed", handler);
  },

  /**
   * Removes a previously subscribed listener for project list changes.
   * @param callback The exact callback function that was used to subscribe.
   */
  removeProjectListChangedListener: (callback: ProjectListCallback): void => {
    ipcRenderer.removeListener("ipc:project-list-changed", callback);
  }
});

// Note: Using 'any' or 'any[]' for payload types in preload is common for flexibility,
// as strict typing across Electron's IPC boundary requires careful setup of shared types.
// The renderer-side store/hook should apply more specific types (e.g., UserQueryOutput, ProjectType[]).
