import { ipcRenderer } from "electron";

import { IPC_CHANNELS } from "../../../shared/constants";

export interface IWindowAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  isDev: () => Promise<boolean>;
}

export function createWindowAPI(): IWindowAPI {
  return {
    minimize: minimizeWindow,
    maximize: maximizeWindow,
    close: closeWindow,
    isMaximized: isWindowMaximized,
    isDev: isDevMode,
  };
}

function minimizeWindow(): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE);
}

function maximizeWindow(): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE);
}

function closeWindow(): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE);
}

function isWindowMaximized(): Promise<boolean> {
  return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED);
}

function isDevMode(): Promise<boolean> {
  return ipcRenderer.invoke(IPC_CHANNELS.APP_IS_DEV);
}
