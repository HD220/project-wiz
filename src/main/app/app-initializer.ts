import { app } from "electron";
import squirrelStartup from "electron-squirrel-startup";

import { registerAllHandlers } from "./handlers-registry";

import { setupAppEventHandlers } from "./app-event-handlers";
import { initializeAppServices } from "./app-services";
import { setupWindowHandlers } from "./app-window-handlers";
import { WindowManager } from "./window-manager";

export class AppInitializer {
  private windowManager: WindowManager;

  constructor() {
    this.windowManager = new WindowManager();
  }

  async initialize(): Promise<void> {
    if (squirrelStartup) {
      app.quit();
      return;
    }

    await this.setupApp();
    this.setupHandlers();
    await initializeAppServices();
  }

  private async setupApp(): Promise<void> {
    await app.whenReady();
    this.windowManager.createWindow();
  }

  private setupHandlers(): void {
    setupAppEventHandlers(this.windowManager);
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    registerAllHandlers();
    setupWindowHandlers(this.windowManager);
  }
}
