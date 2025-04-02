import { ipcMain, utilityProcess, MessageChannelMain } from "electron";
import path from "path";
import { IPCManager } from "./ipc.js";
import { performance } from "perf_hooks";

export class WorkerService {
  private workerProcess: Electron.UtilityProcess;
  private loadedModels = new Map<string, { lastUsed: number; size: number }>();
  private maxModels = 3;
  private cleanupInterval = 60000;
  private memoryThreshold = 0.8;
  private workerIPC!: IPCManager;

  constructor() {
    this.workerProcess = utilityProcess.fork(
      path.join(__dirname, "worker-bridge.js"),
      [],
      { stdio: "inherit" }
    );

    const { port1, port2 } = new MessageChannelMain();
    this.workerProcess.postMessage({ type: "port" }, [port1]);
    this.workerIPC = new IPCManager(port2);

    this.setupHandlers();
    this.startMemoryMonitoring();
  }

  private setupHandlers() {
    ipcMain.handle("worker:initialize", async (_event, payload) => {
      return await this.workerIPC.requestResponse("initializeLlama", payload);
    });

    ipcMain.handle("worker:loadModel", async (_event, payload) => {
      this.trackModelUsage(payload.modelPath, payload.estimatedSize);
      return await this.workerIPC.requestResponse("loadModel", payload);
    });

    ipcMain.handle("worker:createContext", async (_event, payload) => {
      return await this.workerIPC.requestResponse("createContext", payload);
    });

    ipcMain.handle("worker:initializeSession", async (_event, payload) => {
      return await this.workerIPC.requestResponse("initializeSession", payload);
    });

    ipcMain.handle("worker:prompt", async (_event, payload) => {
      return await this.workerIPC.requestResponse("processRequest", payload);
    });

    ipcMain.handle("worker:unloadModel", async (_event, modelPath) => {
      return await this.workerIPC.requestResponse("unloadModel", { modelPath });
    });
  }

  private trackModelUsage(modelPath: string, estimatedSize: number) {
    this.loadedModels.set(modelPath, {
      lastUsed: performance.now(),
      size: estimatedSize,
    });
    this.cleanupOldModels();
  }

  private async cleanupOldModels() {
    if (this.loadedModels.size <= this.maxModels) return;

    const sortedModels = [...this.loadedModels.entries()].sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed
    );

    while (this.loadedModels.size > this.maxModels) {
      const [oldestModel] = sortedModels.shift()!;
      this.loadedModels.delete(oldestModel);
      await this.workerIPC.requestResponse("unloadModel", {
        modelPath: oldestModel,
      });
    }
  }

  private startMemoryMonitoring() {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const usageRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;

      if (usageRatio > this.memoryThreshold) {
        console.warn(`Memory usage high: ${(usageRatio * 100).toFixed(1)}%`);
        this.cleanupOldModels();
      }
    }, this.cleanupInterval);
  }
}
