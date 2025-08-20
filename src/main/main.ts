import * as path from "path";

import dotenv from "dotenv";
// Configure dotenv
dotenv.config();

import { app, BrowserWindow } from "electron";
import squirrel from "electron-squirrel-startup";

// import { QueueClient } from "@/shared/queue-client/queue-client"; // Commented out - used only in test code
// Worker management
// import { initializeAgenticWorkerHandler, agenticWorkerHandler } from "@/shared/worker/agentic-worker.handler"; // Removed - will be rewritten

// Agent response system

// Import all IPC handlers
import agentActivateHandler from "@/main/ipc/agent/activate/invoke";
import agentCreateHandler from "@/main/ipc/agent/create/invoke";
import agentGetHandler from "@/main/ipc/agent/get/invoke";
import agentInactivateHandler from "@/main/ipc/agent/inactivate/invoke";
import agentListHandler from "@/main/ipc/agent/list/invoke";
import agentUpdateHandler from "@/main/ipc/agent/update/invoke";
import authGetSessionHandler from "@/main/ipc/auth/get-session/invoke";
import authLoginHandler from "@/main/ipc/auth/login/invoke";
import authLogoutHandler from "@/main/ipc/auth/logout/invoke";
import channelArchiveHandler from "@/main/ipc/channel/archive/invoke";
import channelCreateHandler from "@/main/ipc/channel/create/invoke";
import channelGetHandler from "@/main/ipc/channel/get/invoke";
import channelListHandler from "@/main/ipc/channel/list/invoke";
import channelUnarchiveHandler from "@/main/ipc/channel/unarchive/invoke";
import channelUpdateHandler from "@/main/ipc/channel/update/invoke";
import conversationGetHandler from "@/main/ipc/conversation/get/invoke";
import conversationSendMessageHandler from "@/main/ipc/conversation/send-message/invoke";
import dmAddParticipantHandler from "@/main/ipc/dm/add-participant/invoke";
import dmArchiveHandler from "@/main/ipc/dm/archive/invoke";
import dmCreateHandler from "@/main/ipc/dm/create/invoke";
import dmGetHandler from "@/main/ipc/dm/get/invoke";
import dmListHandler from "@/main/ipc/dm/list/invoke";
import dmRemoveParticipantHandler from "@/main/ipc/dm/remove-participant/invoke";
import dmUnarchiveHandler from "@/main/ipc/dm/unarchive/invoke";
import llmProviderActivateHandler from "@/main/ipc/llm-provider/activate/invoke";
import llmProviderCreateHandler from "@/main/ipc/llm-provider/create/invoke";
import llmProviderGetHandler from "@/main/ipc/llm-provider/get/invoke";
import llmProviderGetDefaultHandler from "@/main/ipc/llm-provider/get-default/invoke";
import llmProviderGetKeyHandler from "@/main/ipc/llm-provider/get-key/invoke";
import llmProviderInactivateHandler from "@/main/ipc/llm-provider/inactivate/invoke";
import llmProviderListHandler from "@/main/ipc/llm-provider/list/invoke";
import llmProviderSetDefaultHandler from "@/main/ipc/llm-provider/set-default/invoke";
import llmProviderUpdateHandler from "@/main/ipc/llm-provider/update/invoke";
import profileGetThemeHandler from "@/main/ipc/profile/get-theme/invoke";
import profileUpdateHandler from "@/main/ipc/profile/update/invoke";
import projectArchiveHandler from "@/main/ipc/project/archive/invoke";
import projectCreateHandler from "@/main/ipc/project/create/invoke";
import projectGetHandler from "@/main/ipc/project/get/invoke";
import projectListHandler from "@/main/ipc/project/list/invoke";
import projectUnarchiveHandler from "@/main/ipc/project/unarchive/invoke";
import projectUpdateHandler from "@/main/ipc/project/update/invoke";
import userActivateHandler from "@/main/ipc/user/activate/invoke";
import userCreateHandler from "@/main/ipc/user/create/invoke";
import userGetHandler from "@/main/ipc/user/get/invoke";
import userGetByTypeHandler from "@/main/ipc/user/get-by-type/invoke";
import userInactivateHandler from "@/main/ipc/user/inactivate/invoke";
import userListHandler from "@/main/ipc/user/list/invoke";
import userUpdateHandler from "@/main/ipc/user/update/invoke";
import windowCloseHandler from "@/main/ipc/window/close/invoke";
import windowMaximizeHandler from "@/main/ipc/window/maximize/invoke";
import windowMinimizeHandler from "@/main/ipc/window/minimize/invoke";
import windowToggleSizeHandler from "@/main/ipc/window/toggle-size/invoke";
import {
  startAgentResponseWorker,
  stopAgentResponseWorker,
} from "@/main/queue/processors";
import { sessionRegistry } from "@/main/services/session-registry";
import { registerWindow } from "@/main/services/window-registry";
import {
  loadIpcHandlers,
  type HandlerRegistration,
} from "@/main/utils/ipc-loader";

import { initialize } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

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

  // Initialize event system with the main window
  initialize(mainWindow);

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
 * Initialize worker and agent response services
 */
async function initializeWorker(): Promise<void> {
  try {
    logger.info("🚀 Initializing agent response system...");

    // Start agent response worker
    await startAgentResponseWorker();

    logger.info("✅ Agent response system initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize agent response system:", error);
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
  // Create array of all IPC handlers
  const handlers: HandlerRegistration[] = [
    // Agent handlers
    { handler: agentActivateHandler, channel: "invoke:agent:activate" },
    { handler: agentCreateHandler, channel: "invoke:agent:create" },
    { handler: agentGetHandler, channel: "invoke:agent:get" },
    { handler: agentInactivateHandler, channel: "invoke:agent:inactivate" },
    { handler: agentListHandler, channel: "invoke:agent:list" },
    { handler: agentUpdateHandler, channel: "invoke:agent:update" },

    // Auth handlers
    { handler: authGetSessionHandler, channel: "invoke:auth:get-session" },
    { handler: authLoginHandler, channel: "invoke:auth:login" },
    { handler: authLogoutHandler, channel: "invoke:auth:logout" },

    // Channel handlers
    { handler: channelArchiveHandler, channel: "invoke:channel:archive" },
    { handler: channelCreateHandler, channel: "invoke:channel:create" },
    { handler: channelGetHandler, channel: "invoke:channel:get" },
    { handler: channelListHandler, channel: "invoke:channel:list" },
    { handler: channelUnarchiveHandler, channel: "invoke:channel:unarchive" },
    { handler: channelUpdateHandler, channel: "invoke:channel:update" },

    // Conversation handlers
    { handler: conversationGetHandler, channel: "invoke:conversation:get" },
    {
      handler: conversationSendMessageHandler,
      channel: "invoke:conversation:send-message",
    },

    // DM handlers
    { handler: dmAddParticipantHandler, channel: "invoke:dm:add-participant" },
    { handler: dmArchiveHandler, channel: "invoke:dm:archive" },
    { handler: dmCreateHandler, channel: "invoke:dm:create" },
    { handler: dmGetHandler, channel: "invoke:dm:get" },
    { handler: dmListHandler, channel: "invoke:dm:list" },
    {
      handler: dmRemoveParticipantHandler,
      channel: "invoke:dm:remove-participant",
    },
    { handler: dmUnarchiveHandler, channel: "invoke:dm:unarchive" },

    // LLM Provider handlers
    {
      handler: llmProviderCreateHandler,
      channel: "invoke:llm-provider:create",
    },
    { handler: llmProviderGetHandler, channel: "invoke:llm-provider:get" },
    {
      handler: llmProviderGetDefaultHandler,
      channel: "invoke:llm-provider:get-default",
    },
    {
      handler: llmProviderGetKeyHandler,
      channel: "invoke:llm-provider:get-key",
    },
    {
      handler: llmProviderInactivateHandler,
      channel: "invoke:llm-provider:inactivate",
    },
    { handler: llmProviderListHandler, channel: "invoke:llm-provider:list" },
    {
      handler: llmProviderSetDefaultHandler,
      channel: "invoke:llm-provider:set-default",
    },
    {
      handler: llmProviderUpdateHandler,
      channel: "invoke:llm-provider:update",
    },
    {
      handler: llmProviderActivateHandler,
      channel: "invoke:provider:activate",
    },

    // Profile handlers
    { handler: profileGetThemeHandler, channel: "invoke:profile:get-theme" },
    { handler: profileUpdateHandler, channel: "invoke:profile:update" },

    // Project handlers
    { handler: projectArchiveHandler, channel: "invoke:project:archive" },
    { handler: projectCreateHandler, channel: "invoke:project:create" },
    { handler: projectGetHandler, channel: "invoke:project:get" },
    { handler: projectListHandler, channel: "invoke:project:list" },
    { handler: projectUnarchiveHandler, channel: "invoke:project:unarchive" },
    { handler: projectUpdateHandler, channel: "invoke:project:update" },

    // User handlers
    { handler: userActivateHandler, channel: "invoke:user:activate" },
    { handler: userCreateHandler, channel: "invoke:user:create" },
    { handler: userGetHandler, channel: "invoke:user:get" },
    { handler: userGetByTypeHandler, channel: "invoke:user:get-by-type" },
    { handler: userInactivateHandler, channel: "invoke:user:inactivate" },
    { handler: userListHandler, channel: "invoke:user:list" },
    { handler: userUpdateHandler, channel: "invoke:user:update" },

    // Window handlers
    { handler: windowCloseHandler, channel: "invoke:window:close" },
    { handler: windowMaximizeHandler, channel: "invoke:window:maximize" },
    { handler: windowMinimizeHandler, channel: "invoke:window:minimize" },
    { handler: windowToggleSizeHandler, channel: "invoke:window:toggle-size" },
  ];

  // Load all IPC handlers
  try {
    await loadIpcHandlers(handlers);
    logger.info("✅ All IPC handlers loaded via handler array");
  } catch (error) {
    logger.error("❌ Failed to load IPC handlers:", error);
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

  // initializeAgenticWorkerHandler(); // Removed - will be rewritten
  await initializeSessionManager();
  await setupAllIpcHandlers();
  initializeJobResultHandler();
  await initializeWorker(); // Worker enabled for agent processing
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

// Cleanup services on app quit
app.on("before-quit", async () => {
  logger.info("App is quitting, cleaning up services");
  try {
    // Stop agent response worker
    await stopAgentResponseWorker();

    logger.info("🛑 Services stopped successfully");
  } catch (error) {
    logger.error("❌ Error stopping services:", error);
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
