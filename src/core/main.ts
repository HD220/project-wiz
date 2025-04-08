import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { WorkerService } from "./services/llm/WorkerService";
import { ModelDownloaderOptions, LLamaChatPromptOptions } from "node-llama-cpp";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

let workerService: WorkerService;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
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

function setupWorkerHandlers() {
  workerService = new WorkerService();

  ipcMain.handle(
    "download-model",
    async (event, options: ModelDownloaderOptions) => {
      try {
        const result = await workerService.downloadModel(options);
        return { success: true, modelPath: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );

  ipcMain.handle(
    "send-prompt",
    async (
      event,
      {
        prompt,
        options,
      }: {
        prompt: string;
        options?: LLamaChatPromptOptions;
      }
    ) => {
      try {
        const response = await workerService.prompt(prompt, options);
        return { success: true, response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

app.whenReady().then(() => {
  setupWorkerHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

import { WorkflowEngine } from './services/workflow';

async function testWorkflow() {
  const workflowEngine = new WorkflowEngine();
  await workflowEngine.executeWorkflow('workflow.yaml');
}

testWorkflow();
