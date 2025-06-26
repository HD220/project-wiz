// src_refactored/presentation/electron/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { registerChatIPCHandlers } from './ipc-chat.handlers'; // Adjust path if needed

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
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
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development' || MAIN_WINDOW_VITE_DEV_SERVER_URL) {
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
  registerChatIPCHandlers();
  // Register other IPC handlers here (e.g., for onboarding, projects, etc.)

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
  // Example: unregisterChatIPCHandlers();
});

// Expose a simple function for preload to check if running in dev
ipcMain.handle('app:is-dev', () => {
    return process.env.NODE_ENV === 'development' || !!MAIN_WINDOW_VITE_DEV_SERVER_URL;
});

console.log('[Main Process] Main process script loaded.');
