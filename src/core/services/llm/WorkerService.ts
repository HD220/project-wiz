import { ipcMain, utilityProcess, MessageChannelMain } from "electron";
import path from "path";
import { IPCManager } from "./ipc.js";
import { performance } from "perf_hooks";
import {
  ModelDownloaderOptions,
  LlamaOptions,
  LlamaModelOptions,
  LlamaContextOptions,
  LlamaChatSessionOptions,
  LLamaChatPromptOptions,
} from "node-llama-cpp";

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
    ipcMain.handle(
      "worker:initialize",
      async (_event, options: LlamaOptions) => {
        return await this.workerIPC.requestResponse("initializeLlama", options);
      }
    );

    ipcMain.handle(
      "worker:loadModel",
      async (_event, options: LlamaModelOptions) => {
        return await this.workerIPC.requestResponse("loadModel", options);
      }
    );

    ipcMain.handle(
      "worker:createContext",
      async (_event, options: LlamaContextOptions) => {
        return await this.workerIPC.requestResponse("createContext", options);
      }
    );

    ipcMain.handle(
      "worker:initializeSession",
      async (_event, options: LlamaChatSessionOptions) => {
        return await this.workerIPC.requestResponse(
          "initializeSession",
          options
        );
      }
    );

    ipcMain.handle(
      "worker:prompt",
      async (
        _event,
        {
          prompt,
          options,
        }: { prompt: string; options?: LLamaChatPromptOptions }
      ) => {
        return await this.workerIPC.requestResponse("prompt", {
          prompt,
          options,
        });
      }
    );

    ipcMain.handle(
      "worker:unloadModel",
      async (_event, options: { modelPath: string }) => {
        return await this.workerIPC.requestResponse("unloadModel", options);
      }
    );

    ipcMain.handle(
      "worker:downloadModel",
      async (_event, options: ModelDownloaderOptions) => {
        return await this.workerIPC.requestResponse("downloadModel", options);
      }
    );
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

  public async downloadModel(options: ModelDownloaderOptions) {
    return await this.workerIPC.requestResponse("downloadModel", options);
  }

  public async prompt(prompt: string, options?: LLamaChatPromptOptions) {
    return await this.workerIPC.requestResponse("prompt", {
      prompt,
      options,
    });
  }
}
