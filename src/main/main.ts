import * as path from "path";

// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { app, BrowserWindow } from "electron";
import squirrel from "electron-squirrel-startup";

import { sessionRegistry } from "@/main/services/session-registry";
// import { QueueClient } from "@/shared/queue-client/queue-client"; // Commented out - used only in test code
import { getLogger } from "@/shared/services/logger/config";
import { startWorker, stopWorker } from "@/main/services/worker-manager";
import { initializeEventBus, eventBus } from "@/shared/services/events/event-bus";
// import { initializeAgenticWorkerHandler, agenticWorkerHandler } from "@/shared/worker/agentic-worker.handler"; // Removed - will be rewritten
import { loadIpcHandlers } from "@/main/utils/ipc-loader";
import { registerWindow } from "@/main/services/window-registry";

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

  // Register window in WindowRegistry for IPC handlers
  registerWindow("main", mainWindow);

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    logger.info(`DEV URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", async () => {
    logger.info("Main window ready to show");
    mainWindow?.show();
    
    // Initialize job creation after window is ready
    // if (mainWindow) {
    //   await initializeStartupJob();
    // }
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
    await sessionRegistry.loadFromDatabase();
    logger.info("Session registry initialized");
  } catch (error) {
    logger.error("Failed to initialize session registry:", error);
  }
}

/**
 * Initialize job result handler service
 */
function initializeJobResultHandler(): void {
  try {
    logger.info("Job result handler service started");
  } catch (error) {
    logger.error("Failed to start job result handler service:", error);
  }
}

/**
 * Initialize worker process
 */
async function initializeWorker(): Promise<void> {
  try {
    await startWorker();
    logger.info("Worker process started successfully");
  } catch (error) {
    logger.error("Failed to start worker process:", error);
    // Don't fail the app if worker fails to start - it can be started later
  }
}

/**
 * Initialize startup job with API key from environment
 * COMMENTED OUT - Test code for worker functionality
 */
// async function initializeStartupJob(): Promise<void> {
//   try {
//     const apiKey = process.env["LLM_API_KEY"];
//     if (!apiKey) {
//       logger.warn("LLM_API_KEY environment variable not found, skipping startup job creation");
//       return;
//     }

//     logger.info("Starting startup job creation process");
    
//     const queueClient = new QueueClient("llm-jobs");
//     logger.info("QueueClient created for llm-jobs queue");
    
//     const jobData = {
//       agent: {
//         name: "StartupAgent",
//         role: "System Initialization Agent",
//         backstory: "A specialized agent responsible for system startup verification and initialization tasks."
//       },
//       messages: [{
//         role: "user",
//         content: "System has started successfully. Please confirm initialization and provide a brief status report."
//       }],
//       provider: "deepseek",
//       model: "deepseek-chat",
//       apiKey: apiKey
//     };
    
//     const jobOptions = {
//       priority: 1,
//       attempts: 3
//     };
    
//     logger.info("About to send job to worker", { jobData, jobOptions });
    
//     const jobResult = await queueClient.add(jobData, jobOptions);

//     logger.info(`Startup job created successfully with ID: ${jobResult.jobId}`);
//   } catch (error) {
//     logger.error("Failed to create startup job:", error);
//     if (error instanceof Error) {
//       logger.error("Error details:", {
//         message: error.message,
//         stack: error.stack
//       });
//     }
//   }
// }

/**
 * Setup all IPC handlers via auto-discovery system
 */
async function setupAllIpcHandlers(): Promise<void> {
  // Load all IPC handlers via auto-discovery
  try {
    await loadIpcHandlers();
    logger.info("✅ All IPC handlers loaded via auto-discovery");
  } catch (error) {
    logger.error("❌ Failed to load colocated IPC handlers:", error);
  }









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

  initializeEventBus();
  // initializeAgenticWorkerHandler(); // Removed - will be rewritten
  await initializeSessionManager();
  await setupAllIpcHandlers();
  initializeJobResultHandler();
  await initializeWorker();
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

// Cleanup job result handler and worker on app quit
app.on("before-quit", async () => {
  logger.info("App is quitting, cleaning up services");
  
  try {
    // agenticWorkerHandler.shutdown(); // Removed - will be rewritten
    eventBus.shutdown();
    await stopWorker();
    logger.info("AgenticWorkerHandler, EventBus and Worker stopped successfully");
  } catch (error) {
    logger.error("Error stopping services:", error);
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
