import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import squirrelStartup from 'electron-squirrel-startup';

// Direct imports of handler registration functions
import { registerJobHandlers } from './main/handlers/job-handlers';
import { registerQueryHandlers } from './main/handlers/query-handlers';
import { registerUsecaseHandlers } from './main/handlers/usecase-handlers';
// registerServices function from services.ts is not strictly needed if main.ts imports instances.

// Import required service instances from services.ts
import {
    ipcHandlerInstance, // This is new ElectronIpcHandler() from services.ts
    userQuery,
    llmProviderQuery,
    createUserUseCase,
    createLLMProviderConfigUseCase,
    jobDefinitionService,
    queueService,
    jobRepository,         // For registerJobHandlers
    processJobUseCase,   // Mocked in services.ts
    workerService        // For starting the loop
} from './main/handlers/services';

// Commented out unused imports from "ultra-simplified" state
// import { db } from "@/infrastructure/services/drizzle";
// import { initializeDatabase } from "./main/seed";

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

app.on('ready', async () => {
  // await initializeDatabase(db); // Keep this commented for now

  createWindow();

  // Use the ipcHandlerInstance exported from services.ts
  registerQueryHandlers(ipcHandlerInstance, userQuery, llmProviderQuery);
  registerUsecaseHandlers(ipcHandlerInstance, createUserUseCase, createLLMProviderConfigUseCase);
  registerJobHandlers(ipcHandlerInstance, processJobUseCase, jobRepository, jobDefinitionService, queueService);

  if (workerService && typeof workerService.startProcessingLoop === 'function') {
    console.log("main.ts: Attempting to start WorkerService processing loop...");
    workerService.startProcessingLoop(); // Uses default interval
  } else {
    console.error("main.ts: WorkerService or startProcessingLoop not available!");
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
