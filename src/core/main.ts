import {
  app,
  BrowserWindow,
  MessageChannelMain,
  utilityProcess,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { fileURLToPath } from "node:url";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const mainWindow = new BrowserWindow({
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

  // //exemplo chamada do worker (só assi funciona)
  const { port1, port2 } = new MessageChannelMain();

  const workerPath = path.join(__dirname, "llama-worker.js");

  const llamaServiceProcess = utilityProcess.fork(workerPath, [], {
    serviceName: "llama-worker",
  });

  llamaServiceProcess.postMessage("port", [port1]);

  port1.on("message", (data) => {
    console.log("main", data);
  });

  mainWindow.webContents.postMessage("port", [], [port2]);

  mainWindow.webContents.openDevTools();
}

if (started) {
  app.quit();
}

app.on("ready", async () => {
  createWindow();
});

app.on("before-quit", () => {});

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
