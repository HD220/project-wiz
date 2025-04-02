import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import type { Plugin, PluginConfig } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dirname, "worker.js").replace(/\\/g, "/");
const MAX_EXECUTION_TIME = 5000; // 5 seconds

type MessageHandler = {
  resolve: (value: any) => void;
  reject: (reason?: unknown) => void;
};

export class Sandbox {
  private worker: Worker;
  private messageQueue: MessageHandler[] = [];
  private ready = false;
  private executionTimeout?: NodeJS.Timeout;

  constructor() {
    this.worker = new Worker(WORKER_PATH);
    this.setupMessageHandler();
  }

  private setupMessageHandler() {
    this.worker.on("message", (response: unknown) => {
      const handler = this.messageQueue.shift();
      if (!handler) return;

      if (typeof response === "object" && response !== null) {
        const { success, result, error } = response as {
          success: boolean;
          result?: unknown;
          error?: string;
        };

        if (success) {
          handler.resolve(result);
        } else {
          handler.reject(new Error(error));
        }
      } else {
        handler.reject(new Error("Invalid worker response"));
      }
    });

    this.worker.on("error", (error) => {
      const handler = this.messageQueue.shift();
      handler?.reject(error);
    });

    this.worker.on("exit", (code) => {
      if (code !== 0) {
        const handler = this.messageQueue.shift();
        handler?.reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  }

  private sendToWorker<T>(type: string, payload?: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.messageQueue.push({ resolve, reject });
      this.worker.postMessage({ type, payload });
    });
  }

  async init(plugin: new () => Plugin, config: PluginConfig): Promise<void> {
    await this.sendToWorker<void>("init", { plugin, config });
    this.ready = true;
  }

  async execute<T = unknown>(method: string, params: unknown): Promise<T> {
    if (!this.ready) {
      throw new Error("Sandbox not initialized");
    }

    this.executionTimeout = setTimeout(() => {
      this.worker.terminate();
      throw new Error(`Execution timed out after ${MAX_EXECUTION_TIME}ms`);
    }, MAX_EXECUTION_TIME);

    try {
      const result = await this.sendToWorker<T>("execute", { method, params });
      clearTimeout(this.executionTimeout);
      return result;
    } catch (error) {
      clearTimeout(this.executionTimeout);
      throw error;
    }
  }

  async teardown(): Promise<void> {
    if (!this.ready) return;
    if (this.executionTimeout) {
      clearTimeout(this.executionTimeout);
    }
    await this.sendToWorker<void>("teardown");
    await this.worker.terminate();
    this.ready = false;
  }
}
