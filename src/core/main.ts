import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { LlamaProcessManager } from "./llama/LlamaProcessManager";
import { LlamaManager } from "./llama/LlamaManager";
import { fileURLToPath } from "node:url";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

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

  mainWindow.webContents.openDevTools();
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

app.on("ready", () => {
  const llamaProcessManager = new LlamaProcessManager();

  createWindow();

  // Configura o handler do canal Llama
  ipcMain.on("llama-port", (event) => {
    const [port] = event.ports;
    const llamaManager = new LlamaManager();

    port.on("message", async (message) => {
      try {
        const result = await llamaManager.handleMessage(message.data);
        port.postMessage({ success: true, data: result });
      } catch (error) {
        port.postMessage({ success: false, error: error.message });
      }
    });

    port.start();
  });
});

async function handleLlamaMessage(llamaManager: LlamaManager, message: any) {
  switch (message.type) {
    case "init":
      await llamaManager.initialize();
      return { status: "initialized" };

    case "load-model":
      await llamaManager.loadModel(message.modelPath);
      return { status: "model-loaded" };

    case "create-session":
      await llamaManager.createSession(
        message.sessionId,
        message.contextOptions
      );
      return { status: "session-created" };

    case "prompt":
      return await llamaManager.processMessage(message.sessionId, message.text);

    default:
      throw new Error(`Unsupported message type: ${message.type}`);
  }
}

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
