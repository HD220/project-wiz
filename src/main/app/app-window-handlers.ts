import { app, ipcMain } from "electron";
import { WindowManager } from "./window-manager";

export function setupWindowHandlers(windowManager: WindowManager): void {
  ipcMain.handle("window:minimize", () => {
    windowManager.getMainWindow()?.minimize();
  });

  ipcMain.handle("window:maximize", () => {
    const window = windowManager.getMainWindow();
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  ipcMain.handle("window:close", () => {
    app.quit();
  });

  ipcMain.handle("window:is-maximized", () => {
    return windowManager.getMainWindow()?.isMaximized() ?? false;
  });

  ipcMain.handle("app:is-dev", () => {
    return process.env["NODE_ENV"] === "development";
  });
}
