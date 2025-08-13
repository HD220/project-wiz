import * as path from "path";

// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { app, BrowserWindow } from "electron";
import squirrel from "electron-squirrel-startup";

// import { QueueClient } from "@/shared/queue-client/queue-client"; // Commented out - used only in test code
// Worker management
import { startWorker, stopWorker } from "@/main/services/worker-manager";
// import { initializeAgenticWorkerHandler, agenticWorkerHandler } from "@/shared/worker/agentic-worker.handler"; // Removed - will be rewritten

// Import all IPC handlers
import agentActivateHandler from "@/main/ipc/agent/activate/invoke";
import agentCountActiveHandler from "@/main/ipc/agent/count-active/invoke";
import agentCreateHandler from "@/main/ipc/agent/create/invoke";
import agentGetHandler from "@/main/ipc/agent/get/invoke";
import agentInactivateHandler from "@/main/ipc/agent/inactivate/invoke";
import agentListHandler from "@/main/ipc/agent/list/invoke";
import agentUpdateHandler from "@/main/ipc/agent/update/invoke";
import authCheckLoginHandler from "@/main/ipc/auth/check-login/invoke";
import authGetCurrentHandler from "@/main/ipc/auth/get-current/invoke";
import authGetSessionHandler from "@/main/ipc/auth/get-session/invoke";
import authGetUserHandler from "@/main/ipc/auth/get-user/invoke";
import authLoginHandler from "@/main/ipc/auth/login/invoke";
import authLogoutHandler from "@/main/ipc/auth/logout/invoke";
import authRegisterHandler from "@/main/ipc/auth/register/invoke";
import channelArchiveHandler from "@/main/ipc/channel/archive/invoke";
import channelCreateHandler from "@/main/ipc/channel/create/invoke";
import channelGetHandler from "@/main/ipc/channel/get/invoke";
import channelInactivateHandler from "@/main/ipc/channel/inactivate/invoke";
import channelListHandler from "@/main/ipc/channel/list/invoke";
import channelListMessagesHandler from "@/main/ipc/channel/list-messages/invoke";
import channelSendMessageHandler from "@/main/ipc/channel/send-message/invoke";
import channelUnarchiveHandler from "@/main/ipc/channel/unarchive/invoke";
import channelUpdateHandler from "@/main/ipc/channel/update/invoke";
import dmAddParticipantHandler from "@/main/ipc/dm/add-participant/invoke";
import dmArchiveHandler from "@/main/ipc/dm/archive/invoke";
import dmCreateHandler from "@/main/ipc/dm/create/invoke";
import dmGetHandler from "@/main/ipc/dm/get/invoke";
import dmInactivateHandler from "@/main/ipc/dm/inactivate/invoke";
import dmListHandler from "@/main/ipc/dm/list/invoke";
import dmListMessagesHandler from "@/main/ipc/dm/list-messages/invoke";
import dmRemoveParticipantHandler from "@/main/ipc/dm/remove-participant/invoke";
import dmSendMessageHandler from "@/main/ipc/dm/send-message/invoke";
import dmUnarchiveHandler from "@/main/ipc/dm/unarchive/invoke";
import eventRegisterHandler from "@/main/ipc/event/register/invoke";
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
import projectUpdateHandler from "@/main/ipc/project/update/invoke";
import userActivateHandler from "@/main/ipc/user/activate/invoke";
import userCreateHandler from "@/main/ipc/user/create/invoke";
import userGetHandler from "@/main/ipc/user/get/invoke";
import userGetByTypeHandler from "@/main/ipc/user/get-by-type/invoke";
import userGetUserStatsHandler from "@/main/ipc/user/get-user-stats/invoke";
import userInactivateHandler from "@/main/ipc/user/inactivate/invoke";
import userListHandler from "@/main/ipc/user/list/invoke";
import userListAgentsHandler from "@/main/ipc/user/list-agents/invoke";
import userListAvailableUsersHandler from "@/main/ipc/user/list-available-users/invoke";
import userListHumansHandler from "@/main/ipc/user/list-humans/invoke";
import userUpdateHandler from "@/main/ipc/user/update/invoke";
import windowCloseHandler from "@/main/ipc/window/close/invoke";
import windowMaximizeHandler from "@/main/ipc/window/maximize/invoke";
import windowMinimizeHandler from "@/main/ipc/window/minimize/invoke";
import windowToggleSizeHandler from "@/main/ipc/window/toggle-size/invoke";
import { sessionRegistry } from "@/main/services/session-registry";
import { registerWindow } from "@/main/services/window-registry";
import {
  loadIpcHandlers,
  type HandlerRegistration,
} from "@/main/utils/ipc-loader";

import {
  initializeEventBus,
  eventBus,
} from "@/shared/services/events/event-bus";
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
    logger.info("🚀 Worker process started successfully");
  } catch (error) {
    logger.error("❌ Failed to start worker process:", error);
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
  // Create array of all IPC handlers
  const handlers: HandlerRegistration[] = [
    // Agent handlers
    { handler: agentActivateHandler, channel: "invoke:agent:activate" },
    { handler: agentCountActiveHandler, channel: "invoke:agent:count-active" },
    { handler: agentCreateHandler, channel: "invoke:agent:create" },
    { handler: agentGetHandler, channel: "invoke:agent:get" },
    { handler: agentInactivateHandler, channel: "invoke:agent:inactivate" },
    { handler: agentListHandler, channel: "invoke:agent:list" },
    { handler: agentUpdateHandler, channel: "invoke:agent:update" },

    // Auth handlers
    { handler: authCheckLoginHandler, channel: "invoke:auth:check-login" },
    { handler: authGetCurrentHandler, channel: "invoke:auth:get-current" },
    { handler: authGetSessionHandler, channel: "invoke:auth:get-session" },
    { handler: authGetUserHandler, channel: "invoke:auth:get-user" },
    { handler: authLoginHandler, channel: "invoke:auth:login" },
    { handler: authLogoutHandler, channel: "invoke:auth:logout" },
    { handler: authRegisterHandler, channel: "invoke:auth:register" },

    // Channel handlers
    { handler: channelArchiveHandler, channel: "invoke:channel:archive" },
    { handler: channelCreateHandler, channel: "invoke:channel:create" },
    { handler: channelGetHandler, channel: "invoke:channel:get" },
    { handler: channelInactivateHandler, channel: "invoke:channel:inactivate" },
    { handler: channelListHandler, channel: "invoke:channel:list" },
    {
      handler: channelListMessagesHandler,
      channel: "invoke:channel:list-messages",
    },
    {
      handler: channelSendMessageHandler,
      channel: "invoke:channel:send-message",
    },
    { handler: channelUnarchiveHandler, channel: "invoke:channel:unarchive" },
    { handler: channelUpdateHandler, channel: "invoke:channel:update" },

    // DM handlers
    { handler: dmAddParticipantHandler, channel: "invoke:dm:add-participant" },
    { handler: dmArchiveHandler, channel: "invoke:dm:archive" },
    { handler: dmCreateHandler, channel: "invoke:dm:create" },
    { handler: dmGetHandler, channel: "invoke:dm:get" },
    { handler: dmInactivateHandler, channel: "invoke:dm:inactivate" },
    { handler: dmListHandler, channel: "invoke:dm:list" },
    { handler: dmListMessagesHandler, channel: "invoke:dm:list-messages" },
    {
      handler: dmRemoveParticipantHandler,
      channel: "invoke:dm:remove-participant",
    },
    { handler: dmSendMessageHandler, channel: "invoke:dm:send-message" },
    { handler: dmUnarchiveHandler, channel: "invoke:dm:unarchive" },

    // Event handlers
    { handler: eventRegisterHandler, channel: "invoke:event:register" },

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

    // Profile handlers
    { handler: profileGetThemeHandler, channel: "invoke:profile:get-theme" },
    { handler: profileUpdateHandler, channel: "invoke:profile:update" },

    // Project handlers
    { handler: projectArchiveHandler, channel: "invoke:project:archive" },
    { handler: projectCreateHandler, channel: "invoke:project:create" },
    { handler: projectGetHandler, channel: "invoke:project:get" },
    { handler: projectListHandler, channel: "invoke:project:list" },
    { handler: projectUpdateHandler, channel: "invoke:project:update" },

    // User handlers
    { handler: userActivateHandler, channel: "invoke:user:activate" },
    { handler: userCreateHandler, channel: "invoke:user:create" },
    { handler: userGetHandler, channel: "invoke:user:get" },
    { handler: userGetByTypeHandler, channel: "invoke:user:get-by-type" },
    { handler: userGetUserStatsHandler, channel: "invoke:user:get-user-stats" },
    { handler: userInactivateHandler, channel: "invoke:user:inactivate" },
    { handler: userListHandler, channel: "invoke:user:list" },
    { handler: userListAgentsHandler, channel: "invoke:user:list-agents" },
    {
      handler: userListAvailableUsersHandler,
      channel: "invoke:user:list-available-users",
    },
    { handler: userListHumansHandler, channel: "invoke:user:list-humans" },
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

  initializeEventBus();
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

// Cleanup job result handler and worker on app quit
app.on("before-quit", async () => {
  logger.info("App is quitting, cleaning up services");

  try {
    eventBus.shutdown();
    await stopWorker(); // Worker enabled - proper cleanup
    logger.info("🛑 Worker and EventBus stopped successfully");
  } catch (error) {
    logger.error("❌ Error stopping services:", error);
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
