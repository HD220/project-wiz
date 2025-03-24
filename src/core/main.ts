import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { LlamaProcessManager } from "./llama/LlamaProcessManager";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let llamaProcessManager: LlamaProcessManager | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.openDevTools();
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

app.on("ready", () => {
  llamaProcessManager = new LlamaProcessManager();

  llamaProcessManager.on("downloadProgress", (data) => {
    mainWindow.webContents.send("llm:download-progress", data);
  });

  llamaProcessManager.on("loadProgress", (data) => {
    mainWindow.webContents.send("llm:load-progress", data);
  });

  ipcMain.handle("llm:download-model", async (event, modelId) => {
    return new Promise<void>((resolve, reject) => {
      llamaProcessManager?.once("downloadComplete", resolve);
      llamaProcessManager?.once("downloadError", reject);
      llamaProcessManager?.emit("downloadModel", modelId);
    });
  });

  createWindow();
});

app.on("before-quit", () => {
  if (llamaProcessManager) {
    llamaProcessManager.shutdown();
  }
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
