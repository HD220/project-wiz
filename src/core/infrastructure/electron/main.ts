import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { HistoryServiceImpl } from "./history-service";
import { saveToken, removeToken, hasToken } from "./github-token-manager";

// import express from "express";
import crypto from "crypto";
// import cors from "cors";

// --- Auth REST API ---
import express from "express";
import cors from "cors";
import { AuthService } from "../../../core/services/auth/auth-service";
import { authMiddleware } from "../../../core/services/auth/middlewares/auth-middleware";

const api = express();
api.use(cors());
api.use(express.json());

const authService = new AuthService();

// Register
api.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
    const user = await authService.register({ email, password });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Login
api.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
    const session = await authService.login({ email, password });
    res.json(session);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

// Logout (stateless)
api.post("/auth/logout", authMiddleware, async (_req, res) => {
  res.status(204).send();
});

// Verify session
api.get("/auth/session", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  const user = await authService.verifySession(token);
  if (!user) return res.status(401).json({ error: "Invalid session" });
  res.json({ id: user.id, email: user.email });
});

// Refresh token
api.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });
    const session = await authService.refreshToken(refreshToken);
    res.json(session);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

// Example protected route
api.get("/protected", authMiddleware, (_req, res) => {
  res.json({ message: "Access granted" });
});

api.listen(3333, () => {
  console.log("Auth API listening on http://localhost:3333");
});
// --- End Auth REST API ---


import { GpuMetricsProviderElectronAdapter } from "./adapters/GpuMetricsProviderElectronAdapter";

import { GitServiceAdapter } from "../git/git-service.adapter";

/**
 * Registers IPC handlers for GitService
 */
function registerGitServiceHandlers() {
  const gitService = new GitServiceAdapter();

  ipcMain.handle("git:addRepository", async (_event, localPath: string, remoteUrl: string, credentialsId?: string) => {
    return gitService.addRepository(localPath, remoteUrl, credentialsId);
  });

  ipcMain.handle("git:listRepositories", async () => {
    return gitService.listRepositories();
  });

  ipcMain.handle("git:getStatus", async (_event, repositoryId: string) => {
    return gitService.getStatus(repositoryId);
  });

  ipcMain.handle("git:commitChanges", async (_event, params) => {
    return gitService.commitChanges(params);
  });

  ipcMain.handle("git:pushChanges", async (_event, params) => {
    return gitService.pushChanges(params);
  });

  ipcMain.handle("git:pullChanges", async (_event, params) => {
    return gitService.pullChanges(params);
  });

  ipcMain.handle("git:createBranch", async (_event, params) => {
    return gitService.createBranch(params);
  });

  ipcMain.handle("git:switchBranch", async (_event, params) => {
    return gitService.switchBranch(params);
  });

  ipcMain.handle("git:deleteBranch", async (_event, params) => {
    return gitService.deleteBranch(params);
  });

  ipcMain.handle("git:listBranches", async (_event, repositoryId: string) => {
    return gitService.listBranches(repositoryId);
  });

  ipcMain.handle("git:getHistory", async (_event, repositoryId: string, branchName?: string) => {
    return gitService.getHistory(repositoryId, branchName);
  });

  ipcMain.handle("git:syncWithRemote", async (_event, repositoryId: string, credentialsId?: string) => {
    return gitService.syncWithRemote(repositoryId, credentialsId);
  });
}


import { z } from "zod";
import { createDatabase } from "./db-client";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

/**
 * Registers IPC handlers for HistoryService
 */
async function registerHistoryServiceHandlers() {
  const db = await createDatabase();
  const historyService = new HistoryServiceImpl(db)
  ipcMain.handle("history:createConversation", async (_event, title?: string) => {
    if (title !== undefined && typeof title !== "string") {
      return { error: "Invalid input" };
    }
    return historyService.createConversation(title);
  });

  ipcMain.handle("history:addMessage", async (_event, conversationId: string, role: "user" | "assistant", content: string) => {
    const schema = z.object({
      conversationId: z.string().min(1),
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    });
    const result = schema.safeParse({ conversationId, role, content });
    if (!result.success) {
      return { error: "Invalid input" };
    }
    return historyService.addMessage(conversationId, role, content);
  });

  ipcMain.handle("history:getConversations", async (_event, params?: { offset?: number; limit?: number; search?: string }) => {
    const schema = z.object({
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      search: z.string().max(200).optional(),
    });
    const result = schema.safeParse(params ?? {});
    if (!result.success) {
      return { error: "Invalid input" };
    }
    return historyService.getConversations(result.data);
  });

  ipcMain.handle("history:getMessages", async (_event, conversationId: string) => {
    if (typeof conversationId !== "string" || conversationId.length === 0) {
      return { error: "Invalid input" };
    }
    return historyService.getMessages(conversationId);
  });

  ipcMain.handle("history:deleteConversation", async (_event, conversationId: string) => {
    if (typeof conversationId !== "string" || conversationId.length === 0) {
      return { error: "Invalid input" };
    }
    return historyService.deleteConversation(conversationId);
  });

  ipcMain.handle("history:exportHistory", async (_event, format: "json" | "csv") => {
    if (format !== "json" && format !== "csv") {
      return { error: "Invalid input" };
    }
    return historyService.exportHistory(format);
  });

  ipcMain.handle("history:renameConversation", async (_event, conversationId: string, newTitle: string) => {
    if (
      typeof conversationId !== "string" ||
      conversationId.length === 0 ||
      typeof newTitle !== "string" ||
      newTitle.length === 0
    ) {
      return { error: "Invalid input" };
    }
    return historyService.renameConversation(conversationId, newTitle);
  });
}

/**
 * Registers IPC handlers for GitHub token management
 */
function registerGitHubTokenHandlers() {
  ipcMain.handle("githubToken:save", async (_event, token: string) => {
    if (typeof token !== "string" || token.length === 0) {
      return { error: "Invalid input" };
    }
    return saveToken(token);
  });

  ipcMain.handle("githubToken:remove", async () => {
    return removeToken();
  });

  ipcMain.handle("githubToken:status", async () => {
    return hasToken();
  });
}

/**
 * Registers IPC handlers for WorkerService metrics
 */
function registerWorkerServiceHandlers(workerService: import('../../domain/ports/worker-service.port').WorkerServicePort) {
  ipcMain.handle('llm:getMetrics', async () => {
    return workerService.getMetrics();
  });
}

/**
 * Registers IPC handlers for GPU metrics
 */
function registerGpuMetricsHandlers(gpuMetricsProvider: import('../../domain/ports/gpu-metrics-provider.port').GpuMetricsProviderPort) {
  ipcMain.handle('dashboard:get-gpu-metrics', async () => {
    return gpuMetricsProvider.getGpuMetrics();
  });
}

// Pairing token generated at initialization
const pairingToken = crypto.randomBytes(32).toString("hex");

// Initializes HTTP API for the mobile app
// function startMobileApiServer() {
//   const api = express();
//   api.use(cors());
//   api.use(express.json());

//   // Authentication middleware
//   api.use((req, res, next) => {
//     if (req.path === "/pairing") {
//       return next();
//     }
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//     const token = authHeader.substring(7);
//     if (token !== pairingToken) {
//       return res.status(403).json({ error: "Forbidden" });
//     }
//     next();
//   });

//   // Endpoint for pairing via QR code
//   api.get("/pairing", (req, res) => {
//     res.json({
//       token: pairingToken,
//       url: `http://localhost:3001`,
//     });
//   });

//   // Bot status endpoint
//   api.get("/status", (req, res) => {
//     res.json({ status: "online" });
//   });

//   // History endpoint
//   api.get("/history", async (req, res) => {
//     const conversations = await historyService.getConversations();
//     res.json(conversations);
//   });

//   // Basic settings endpoint (mock)
//   api.get("/settings", (req, res) => {
//     res.json({
//       language: "pt-BR",
//       theme: "dark",
//     });
//   });

//   api.listen(3001, () => {
//     console.log("Mobile API listening on http://localhost:3001");
//   });
// }

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
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

app.whenReady().then(async () => {
  const { WorkerServiceAdapter } = await import('../worker/adapters/WorkerServiceAdapter');
  const workerService = await WorkerServiceAdapter.create();

  const gpuMetricsProvider = new GpuMetricsProviderElectronAdapter();

  registerHistoryServiceHandlers();
  registerGitHubTokenHandlers();
  registerWorkerServiceHandlers(workerService);
  registerGpuMetricsHandlers(gpuMetricsProvider);
  registerGitServiceHandlers();

  createWindow();
  // startMobileApiServer();

  app.on('activate', () => {
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
