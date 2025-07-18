import path from "path";

import { BrowserWindow } from "electron";

export function createMainWindow(): BrowserWindow {
  return new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
}
