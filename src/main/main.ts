import path from "path";

import { app, BrowserWindow, ipcMain } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import { bootstrap } from "@/main/bootstrap";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { EventBus } from "@/main/kernel/event-bus";
import { db } from "@/main/persistence/db";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (squirrelStartup) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.on("ready", async () => {
  console.log("[Main Process] Initializing business modules...");
  const cqrsDispatcher = new CqrsDispatcher();
  const eventBus = new EventBus();

  await bootstrap(cqrsDispatcher, eventBus, db);
  console.log("[Main Process] All business modules initialized.");

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {});

ipcMain.handle("app:is-dev", () => {
  return (
    process.env.NODE_ENV === "development" ||
    !!process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL
  );
});

console.log("[Main Process] Main process script loaded.");
