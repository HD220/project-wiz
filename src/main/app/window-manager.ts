import { BrowserWindow } from "electron";

import { createMainWindow } from "./window-config";
import { loadWindowContent } from "./window-content-loader";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  createWindow(): BrowserWindow {
    this.mainWindow = createMainWindow();
    loadWindowContent(this.mainWindow);
    this.setupDevTools();
    this.setupEventHandlers();
    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  private setupDevTools(): void {
    if (!this.mainWindow) return;

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  private setupEventHandlers(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }
}
