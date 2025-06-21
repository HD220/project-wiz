import 'reflect-metadata'; // Added for InversifyJS
import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import "./main/handlers";
import { db } from "@/infrastructure/services/drizzle"; // This might be an issue if db is initialized before DI
import { initializeDatabase } from "./main/seed";
import { main } from "./main/agent";

// InversifyJS Container and Worker Pool
import { appContainer } from '../../../electron/dependency-injection/inversify.config';
import { IWorkerPool } from '../../../../core/application/ports/worker-pool.interface';
import { TYPES } from '../../../electron/dependency-injection/types';


declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (squirrelStartup) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  // mainWindow.webContents.openDevTools();
  // mainWindow.setMenu(null);
};

app.on("ready", async () => {
  // It's generally better to initialize DB via DI container if it's managed there.
  // For now, assuming initializeDatabase and db are separate or will be integrated into DI later.
  await initializeDatabase(db);
  createWindow();

  // Start the WorkerPool
  try {
    console.log("Attempting to start worker pool...");
    const workerPool = appContainer.get<IWorkerPool>(TYPES.IWorkerPool);
    const startResult = await workerPool.start();
    if (startResult.isError()) {
        console.error("Failed to start worker pool:", startResult.message, startResult.error);
    } else {
        console.log("Worker pool started successfully.");
    }
  } catch (e) {
      console.error("Error initializing/starting worker pool:", e);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Consider if shutdown logic is needed here or only in before-quit
    app.quit();
  }
});

app.on('before-quit', async (event) => {
    event.preventDefault(); // Prevent immediate quit
    console.log("Application before-quit: Shutting down worker pool...");
    try {
        const workerPool = appContainer.get<IWorkerPool>(TYPES.IWorkerPool);
        await workerPool.shutdown();
        console.log("Worker pool shutdown complete. Quitting application.");
    } catch (e) {
        console.error("Error shutting down worker pool:", e);
    } finally {
        app.exit(); // Force the quit after attempting the shutdown
    }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
