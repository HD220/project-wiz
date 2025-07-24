import * as path from "path";

import { app, BrowserWindow, ipcMain } from "electron";
import squirrel from "electron-squirrel-startup";

import { setupAgentHandlers } from "@/main/features/agent/agent.handler";
import { setupLlmProviderHandlers } from "@/main/features/agent/llm-provider/llm-provider.handler";
import { setupAgentMemoryHandlers } from "@/main/features/agent/memory/memory.handler";
import { setupAuthHandlers } from "@/main/features/auth/auth.handler";
import { AuthService } from "@/main/features/auth/auth.service";
import { setupConversationsHandlers } from "@/main/features/conversation/conversation.handler";
import { setupProjectHandlers } from "@/main/features/project/project.handler";
import { setupProfileHandlers } from "@/main/features/user/profile.handler";
import { setupUserHandlers } from "@/main/features/user/user.handler";
import { getLogger } from "@/main/utils/logger";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

// Initialize logger for main process
const logger = getLogger("main");

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (squirrel) {
  app.quit();
}

// Window manager state
let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
function createMainWindow(): void {
  logger.info("Creating main window");

  // Create the browser window
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false, // Remove frame for custom titlebar
    show: false, // Don't show until ready
  });

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    logger.info("Main window ready to show");
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    logger.info("Main window closed");
    mainWindow = null;
  });

  // Open DevTools in development
  if (process.env["NODE_ENV"] === "development") {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Initialize session manager
 */
async function initializeSessionManager(): Promise<void> {
  try {
    await AuthService.initializeSession();
    logger.info("Session manager initialized");
  } catch (error) {
    logger.error("Failed to initialize session manager:", error);
  }
}

/**
 * Setup all IPC handlers
 */
function setupAllIpcHandlers(): void {
  setupAuthHandlers();
  logger.info("Authentication IPC handlers registered");

  setupUserHandlers();
  logger.info("User IPC handlers registered");

  setupProfileHandlers();
  logger.info("Profile IPC handlers registered");

  setupProjectHandlers();
  logger.info("Project IPC handlers registered");

  setupConversationsHandlers();
  logger.info("Conversations IPC handlers registered");

  setupLlmProviderHandlers();
  logger.info("LLM Provider IPC handlers registered");

  setupAgentHandlers();
  logger.info("Agent IPC handlers registered");

  setupAgentMemoryHandlers();
  logger.info("Agent Memory IPC handlers registered");

  setupWindowHandlers();
  logger.info("Window control IPC handlers registered");
}

/**
 * Setup macOS specific event handlers
 */
function setupMacOSHandlers(): void {
  // On macOS, re-create window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info("Dock icon clicked, creating new window");
      createMainWindow();
    }
  });
}

/**
 * App event handlers
 */
app.whenReady().then(async () => {
  logger.info("App is ready, initializing IPC handlers and main window");

  await initializeSessionManager();
  setupAllIpcHandlers();
  createMainWindow();
  setupMacOSHandlers();
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  logger.info("All windows closed");
  if (process.platform !== "darwin") {
    logger.info("Quitting application");
    app.quit();
  }
});

// Handle app activation (macOS)
app.on("activate", () => {
  if (mainWindow === null) {
    logger.info("App activated, creating main window");
    createMainWindow();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    logger.warn(`Blocked new window creation: ${url}`);
    return { action: "deny" };
  });
});

// Handle unhandled errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason);
});

/**
 * Setup window control IPC handlers
 */
function setupWindowHandlers(): void {
  ipcMain.handle("window:minimize", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle("window:maximize", () => {
    if (mainWindow) {
      mainWindow.maximize();
    }
  });

  ipcMain.handle("window:toggle-maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle("window:close", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });
}

logger.info("Main process initialized");
