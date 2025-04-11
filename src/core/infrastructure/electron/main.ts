import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { HistoryServiceImpl } from "./history-service";
import { saveToken, removeToken, hasToken } from "./github-token-manager";

// import express from "express";
import crypto from "crypto";
// import cors from "cors";

import { GpuMetricsProviderElectronAdapter } from "./adapters/GpuMetricsProviderElectronAdapter";

import { z } from "zod";
import { createDatabase } from "./db-client";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

/**
 * Registra os handlers IPC para o HistoryService
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
 * Registra os handlers IPC para gerenciamento do token GitHub
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
 * Registra os handlers IPC para métricas do WorkerService
 */
function registerWorkerServiceHandlers(workerService: import('../../domain/ports/worker-service.port').WorkerServicePort) {
  ipcMain.handle('llm:getMetrics', async () => {
    return workerService.getMetrics();
  });
}

/**
 * Registra os handlers IPC para métricas de GPU
 */
function registerGpuMetricsHandlers(gpuMetricsProvider: import('../../domain/ports/gpu-metrics-provider.port').GpuMetricsProviderPort) {
  ipcMain.handle('dashboard:get-gpu-metrics', async () => {
    return gpuMetricsProvider.getGpuMetrics();
  });
}

// Token de pareamento gerado na inicialização
const pairingToken = crypto.randomBytes(32).toString("hex");

// Inicializa API HTTP para o app mobile
// function startMobileApiServer() {
//   const api = express();
//   api.use(cors());
//   api.use(express.json());

//   // Middleware de autenticação
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

//   // Endpoint para pareamento via QR code
//   api.get("/pairing", (req, res) => {
//     res.json({
//       token: pairingToken,
//       url: `http://localhost:3001`,
//     });
//   });

//   // Endpoint status do bot
//   api.get("/status", (req, res) => {
//     res.json({ status: "online" });
//   });

//   // Endpoint histórico
//   api.get("/history", async (req, res) => {
//     const conversations = await historyService.getConversations();
//     res.json(conversations);
//   });

//   // Endpoint configurações básicas (mock)
//   api.get("/settings", (req, res) => {
//     res.json({
//       language: "pt-BR",
//       theme: "dark",
//     });
//   });

//   api.listen(3001, () => {
//     console.log("API mobile listening on http://localhost:3001");
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
