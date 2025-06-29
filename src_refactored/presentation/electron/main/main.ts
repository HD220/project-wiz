// src_refactored/presentation/electron/main/main.ts
import path from 'path';

import { app, BrowserWindow, ipcMain } from 'electron';
import squirrelStartup from 'electron-squirrel-startup'; // ES6 import

import { registerChatIPCHandlers } from './ipc-chat.handlers'; // Legacy?
import { registerProjectIPCHandlers as registerLegacyProjectIPCHandlers } from './ipc-project.handlers'; // Legacy? Renamed to avoid conflict

// New Handlers
import { registerProjectHandlers } from './handlers/project.handlers';
import { registerPersonaTemplateHandlers } from './handlers/persona-template.handlers';
import { registerAgentInstanceHandlers } from './handlers/agent-instance.handlers';
import { registerLLMConfigHandlers } from './handlers/llm-config.handlers';
import { registerUserHandlers } from './handlers/user.handlers';
import { registerDMHandlers } from './handlers/dm.handlers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) { // Check the imported value
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // IMPORTANT: This assumes preload.js will be in this location after build
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the index.html of the app.
  if (import.meta.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(import.meta.env.MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${import.meta.env.MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development' || import.meta.env.MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Register IPC handlers
  console.log('[Main Process] Registering IPC Handlers...');
  // Legacy handlers (if still needed)
  registerChatIPCHandlers();
  registerLegacyProjectIPCHandlers();

  // New refactored handlers
  registerProjectHandlers();
  console.log('[Main Process] Project handlers registered.');
  registerPersonaTemplateHandlers();
  console.log('[Main Process] Persona Template handlers registered.');
  registerAgentInstanceHandlers();
  console.log('[Main Process] Agent Instance handlers registered.');
  registerLLMConfigHandlers();
  console.log('[Main Process] LLM Config handlers registered.');
  registerUserHandlers();
  console.log('[Main Process] User handlers registered.');
  registerDMHandlers();
  console.log('[Main Process] DM handlers registered.');

  console.log('[Main Process] All IPC Handlers registered.');

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Ensure appContainer is initialized if it's used by handlers directly
// import '../../../infrastructure/ioc/inversify.config'; // This might be needed if handlers access appContainer directly at module load time
// However, it's better if handlers get dependencies passed or resolve them lazily.
// For the current ipc-chat.handlers.ts, it attempts to use appContainer.
// This line should ideally be in the main entry point of the application logic,
// before any services using DI are instantiated.
// For now, this is a basic main.ts. DI setup for main process is a larger topic.

// Handle IPC unregistration on quit (optional, good practice if handlers hold resources)
app.on('will-quit', () => {
  // Example:
  // unregisterChatIPCHandlers();
  // unregisterProjectIPCHandlers(); // Example if unregistration is needed
});

// Expose a simple function for preload to check if running in dev
ipcMain.handle('app:is-dev', () => {
    return process.env.NODE_ENV === 'development' || !!import.meta.env.MAIN_WINDOW_VITE_DEV_SERVER_URL;
});

console.log('[Main Process] Main process script loaded.');
