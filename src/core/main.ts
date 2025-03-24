import {
  app,
  BrowserWindow,
  ipcMain,
  utilityProcess,
  MessageChannelMain,
  ipcRenderer,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { EventEmitter } from "events";
import type { LlamaUtilityMessage } from "./llama/types";
import { fileURLToPath } from "node:url";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let llamaProcess: Electron.UtilityProcess | null = null;

function createLlamaProcess() {
  type LlamaEventMap = {
    [K in LlamaUtilityMessage["type"]]: [
      data: {
        [P in keyof Extract<
          LlamaUtilityMessage,
          { type: K }
        > as P extends "type" ? never : P]: Extract<
          LlamaUtilityMessage,
          { type: K }
        >[P];
      }
    ];
  };

  const emitter = new EventEmitter<
    LlamaEventMap & {
      stdout: [any];
      stderr: [any];
    }
  >();
  const { port1: mainPort, port2: childPort } = new MessageChannelMain();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const workerPath = path.join(__dirname, "llama/llama-worker.js");
  llamaProcess = utilityProcess.fork(workerPath, [], {
    serviceName: "llama-process",
    stdio: "pipe",
  });
  llamaProcess.stdout?.on("data", (data) => {
    emitter.emit("stdout", data);
    console.log(`[LLAMA] stdout: ${data}`);
  });

  llamaProcess.stderr?.on("data", (data) => {
    emitter.emit("stderr", data);
    console.error(`[LLAMA] stderr: ${data}`);
  });

  llamaProcess.on("spawn", () => {
    llamaProcess.postMessage("init", [childPort]);

    mainPort.on("message", (event) => {
      const { data } = event;
      const { type, ...message }: LlamaUtilityMessage = data;

      if (type === "ready") {
        childPort.emit("prompt", { text: "" });
      }

      emitter.emit(type, message);
      // console.log(type, message);
    });

    mainPort.start();
  });

  llamaProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error("error", `[LLAMA] Process stopped with exit code ${code}`);
    }
    mainPort.close();
  });

  emitter.on("prompt", (prompt) => {
    console.log("sending", prompt);
    mainPort.postMessage({
      type: "prompt",
      prompt,
    });
  });

  return emitter;
}

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
  const processEmitter = createLlamaProcess();

  processEmitter.on("downloadProgress", (data) => {
    // console.log("enviando para o renderer", data);
    mainWindow.webContents.send("llm:download-progress", data);
  });

  processEmitter.on("loadProgress", (data) => {
    mainWindow.webContents.send("llm:load-progress", data);
  });

  createWindow();
});

app.on("before-quit", () => {
  if (llamaProcess) {
    llamaProcess.kill();
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
