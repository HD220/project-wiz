import * as path from "path";

import { app, BrowserWindow } from "electron";
import squirrel from "electron-squirrel-startup";

import { setupAgentHandlers } from "./agents/agent.handlers";
import { setupLlmProviderHandlers } from "./agents/llm-providers/llm-provider.handlers";
import { setupConversationsHandlers } from "./conversations/conversations.handlers";
import { setupProjectHandlers } from "./project/project.handlers";
import { setupAuthHandlers } from "./user/authentication/auth.handlers";
import { setupProfileHandlers } from "./user/profile/profile.handlers";
import { getLogger } from "./utils/logger";

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
    titleBarStyle: "hiddenInset",
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
 * App event handlers
 */
app.whenReady().then(() => {
  logger.info("App is ready, initializing IPC handlers and main window");

  // Setup IPC handlers
  setupAuthHandlers();
  logger.info("Authentication IPC handlers registered");

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

  createMainWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info("Dock icon clicked, creating new window");
      createMainWindow();
    }
  });
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

logger.info("Main process initialized");
