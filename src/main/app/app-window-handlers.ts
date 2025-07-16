import { app } from "electron";

import { createSimpleIpcHandler } from "../kernel/ipc-handler-utility";

import { WindowManager } from "./window-manager";

export function setupWindowHandlers(windowManager: WindowManager): void {
  createSimpleIpcHandler("window:minimize", () => {
    windowManager.getMainWindow()?.minimize();
  });

  createSimpleIpcHandler("window:maximize", () => {
    const window = windowManager.getMainWindow();
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  createSimpleIpcHandler("window:close", () => {
    app.quit();
  });

  createSimpleIpcHandler("window:is-maximized", () => {
    return windowManager.getMainWindow()?.isMaximized() ?? false;
  });

  createSimpleIpcHandler("app:is-dev", () => {
    return process.env.NODE_ENV === "development";
  });
}
