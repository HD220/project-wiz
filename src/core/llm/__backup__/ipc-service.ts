import type { IPCManager } from "../ipc";
import type LLMWorker from "../worker";
import type { LLamaChatPromptOptions } from "node-llama-cpp";

type WorkerState = Record<string, unknown>;

export class LLMIPCHandlerService {
  private ipcManager: IPCManager;
  private worker: LLMWorker;
  private heartbeatInterval?: NodeJS.Timeout;
  private state: WorkerState = {};

  constructor(ipcManager: IPCManager, worker: LLMWorker) {
    this.ipcManager = ipcManager;
    this.worker = worker;
    this.setupHandlers();
    this.setupHeartbeat();
  }

  private setupHandlers() {
    this.ipcManager.registerHandler("worker:initialize", ({ options }) =>
      this.worker.initializeLlama(options)
    );

    this.ipcManager.registerHandler("worker:loadModel", ({ options }) =>
      this.worker.loadModel(options)
    );

    this.ipcManager.registerHandler("worker:createContext", ({ options }) =>
      this.worker.createContext(options)
    );

    this.ipcManager.registerHandler("worker:initializeSession", ({ options }) =>
      this.worker.initializeSession(options)
    );

    this.ipcManager.registerHandler(
      "worker:processRequest",
      ({ prompt, options }) => this.processRequestWithProgress(prompt, options)
    );

    this.ipcManager.registerHandler("worker:teardown", () => this.teardown());
    this.ipcManager.registerHandler("worker:getState", () => this.getState());
    this.ipcManager.registerHandler("worker:setState", ({ newState }) =>
      this.setState(newState)
    );
    this.ipcManager.registerHandler("worker:healthcheck", () =>
      this.healthcheck()
    );
  }

  private async processRequestWithProgress(
    prompt: string,
    options?: LLamaChatPromptOptions
  ) {
    try {
      const response = await this.worker.processRequest(prompt, {
        ...options,
        onToken: (tokens) => {
          this.ipcManager.send("worker:progress", { tokens });
        },
      });
      return response;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private teardown() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.state = {};
  }

  private getState(): WorkerState {
    return this.state;
  }

  private setState(newState: WorkerState) {
    this.state = { ...this.state, ...newState };
  }

  private healthcheck() {
    return {
      status: "healthy",
      timestamp: Date.now(),
      state: this.state,
    };
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.ipcManager.send("worker:heartbeat", { timestamp: Date.now() });
    }, 5000);
  }

  private normalizeError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
