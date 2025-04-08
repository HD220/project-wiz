import electron, { ipcMain, utilityProcess, MessageChannelMain } from "electron";
import path from "path";
import { IPCManager } from "./ipc";
import { performance } from "perf_hooks";
import {
  ModelDownloaderOptions,
  LlamaOptions,
  LlamaContextOptions,
  LlamaChatSessionOptions,
  LLamaChatPromptOptions,
} from "node-llama-cpp";
import { WizModelOptions } from "./types";

import { Llama } from "node-llama-cpp";

export class WorkerService {
  private workerProcess: Electron.UtilityProcess | null = null;
  private loadedModels = new Map<string, { lastUsed: number; size: number }>();
  private maxModels = 3;
  private cleanupInterval = 60000;
  private memoryThreshold = 0.8;
  private workerIPC!: IPCManager;
  private promptQueue: {
    prompt: string;
    options?: LLamaChatPromptOptions;
  }[] = [];
  private isProcessingQueue = false;
  private llama: any;

  constructor() {
    const { port1, port2 } = new MessageChannelMain();
    this.workerIPC = new IPCManager(port2);
    this.setupHandlers();
    this.startMemoryMonitoring();
  }

  private setupHandlers() {
    ipcMain.handle(
      "worker:initialize",
      async (_event: any, options: LlamaOptions) => {
        return await this.handleInitialize(_event, options);
      }
    );

    ipcMain.handle(
      "worker:loadModel",
      async (_event: any, options: WizModelOptions) => {
        return await this.loadModel(options);
      }
    );
    ipcMain.handle(
      "worker:createContext",
      async (_event: any, options: LlamaContextOptions) => {
        return await this.handleCreateContext(_event, options);
      }
    );

    ipcMain.handle(
      "worker:initializeSession",
      async (_event: any, options: LlamaChatSessionOptions) => {
        return await this.handleInitializeSession(_event, options);
      }
    );

    ipcMain.handle(
      "worker:prompt",
      async (
        _event: any,
        {
          prompt,
          options,
        }: { prompt: string; options?: LLamaChatPromptOptions }
      ) => {
        return await this.handlePrompt(_event, prompt, options);
      }
    );

    ipcMain.handle(
      "worker:unloadModel",
      async (_event: any, options: { modelPath: string }) => {
        return await this.handleUnloadModel(_event, options);
      }
    );

    ipcMain.handle(
      "worker:downloadModel",
      async (_event: any, options: ModelDownloaderOptions) => {
        return await this.handleDownloadModel(_event, options);
      }
    );

    ipcMain.handle(
      "worker:savePrompts",
      async (
        _event: any,
        options: { modelId: string; prompts: { [key: string]: string } }
      ) => {
        return await this.handleSavePrompts(_event, options);
      }
    );

    ipcMain.handle(
      "worker:loadPrompts",
      async (_event: any, options: { modelId: string }) => {
        return await this.handleLoadPrompts(_event, options);
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
      await this.handleUnloadModel(null, {
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
    return await this.handleDownloadModel(null, options);
  }

  public async prompt(prompt: string, options?: LLamaChatPromptOptions) {
    return await this.handlePrompt(null, prompt, options);
  }

 public async loadModel(options: WizModelOptions) {
    if (this.workerProcess) {
      this.workerProcess.kill();
    }

    this.workerProcess = utilityProcess.fork(
      path.join(__dirname, "llama/worker-bridge.ts"),
      [],
      { stdio: "inherit" }
    );

    const { port1, port2 } = new MessageChannelMain();
    this.workerProcess.postMessage({ type: "port" }, [port1]);
    this.workerIPC = new IPCManager(port2);

    // Pass the model path to the worker
    const modelPath = options.modelPath || ""; // Assuming WizModelOptions has a modelPath
    return await this.workerIPC.requestResponse("loadModel", {
      ...options,
      modelPath,
    });
  }

  public async unloadModel(options: { modelPath: string }) {
    return await this.handleUnloadModel(null, options);
  }

  public async createContext(options: LlamaContextOptions) {
    return await this.handleCreateContext(null, options);
  }

  public async initializeSession(options: LlamaChatSessionOptions) {
    return await this.handleInitializeSession(null, options);
  }

  public async savePrompts(options: { modelId: string; prompts: { [key: string]: string } }) {
    return await this.handleSavePrompts(null, options);
  }

  public async loadPrompts(options: { modelId: string }) {
    return await this.handleLoadPrompts(null, options);
  }

  private async handleInitialize(_event: any, options: LlamaOptions) {
    return await this.workerIPC.requestResponse("initializeLlama", options);
  }

  private async handleCreateContext(_event: any, options: LlamaContextOptions) {
    return await this.workerIPC.requestResponse("createContext", options);
  }

  private async handleInitializeSession(_event: any, options: LlamaChatSessionOptions) {
    return await this.workerIPC.requestResponse(
      "initializeSession",
      options
    );
  }

  private async handlePrompt(_event: any, prompt: string, options?: LLamaChatPromptOptions) {
    this.promptQueue.push({ prompt, options });
    return { success: true };
  }

  private async handleUnloadModel(_event: any, options: { modelPath: string }) {
    return await this.workerIPC.requestResponse("unloadModel", options);
  }

  private async handleDownloadModel(_event: any, options: ModelDownloaderOptions) {
    return await this.workerIPC.requestResponse("downloadModel", options);
  }

  private async handleSavePrompts(_event: any, options: { modelId: string; prompts: { [key: string]: string } }) {
    return await this.workerIPC.requestResponse("savePrompts", options);
  }

  private async handleLoadPrompts(_event: any, options: { modelId: string }) {
    return await this.workerIPC.requestResponse("loadPrompts", options);
  }
}
