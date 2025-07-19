// Preload script for Electron
// This script has access to node.js APIs and will be executed before the renderer process loads

import { contextBridge, ipcRenderer } from "electron";
import type { IpcResponse } from "@/main/types";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/user/authentication/auth.types";
import type { Theme } from "@/main/user/authentication/users.schema";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/project/projects.schema";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // System information
  platform: process.platform,
  version: process.versions.electron,

  // Authentication API
  auth: {
    register: (input: RegisterUserInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:register", input),
    login: (credentials: LoginCredentials): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:login", credentials),
    getCurrentUser: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getCurrentUser"),
    logout: (): Promise<IpcResponse> => ipcRenderer.invoke("auth:logout"),
    isLoggedIn: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:isLoggedIn"),
    getUserById: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getUserById", userId),
  },

  // Profile API
  profile: {
    getTheme: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("profile:getTheme", userId),
    updateTheme: (userId: string, theme: Theme): Promise<IpcResponse> =>
      ipcRenderer.invoke("profile:updateTheme", userId, theme),
  },

  // Projects API
  projects: {
    create: (input: InsertProject): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:create", input),
    findById: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:findById", id),
    listAll: (): Promise<IpcResponse> => ipcRenderer.invoke("projects:listAll"),
    update: (input: UpdateProject): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:update", input),
    archive: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:archive", id),
  },
});

console.log("Preload script loaded successfully");
