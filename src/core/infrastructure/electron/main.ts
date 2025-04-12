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

// Import SessionServiceAdapter for session management
import { SessionServiceAdapter } from "../db/repositories/session-service.adapter";

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
    res.status(200).json(session);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ... (restante do arquivo inalterado)

app.whenReady().then(async () => {
  const { WorkerServiceAdapter } = await import('../worker/adapters/WorkerServiceAdapter');
  const sessionService = new SessionServiceAdapter();
  const workerService = await WorkerServiceAdapter.create(sessionService);

  const gpuMetricsProvider = new GpuMetricsProviderElectronAdapter();

  await registerHistoryServiceHandlers();
  registerGitHubTokenHandlers();
  registerWorkerServiceHandlers(workerService);
  registerGpuMetricsHandlers(gpuMetricsProvider);
  registerGitServiceHandlers();
  await registerSessionServiceHandlers();

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
