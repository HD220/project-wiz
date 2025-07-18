import { app } from "electron";

import { WindowManager } from "./window-manager";

export function setupAppEventHandlers(windowManager: WindowManager): void {
  app.on("activate", () => {
    if (!windowManager.getMainWindow()) {
      windowManager.createWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
