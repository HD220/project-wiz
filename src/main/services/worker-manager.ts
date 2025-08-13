// Simple worker manager using utilityProcess.fork for job processing
// Based on final architecture decision - single worker with automatic restart

import path from "path";
import { fileURLToPath } from "url";

import { utilityProcess } from "electron";

import { getLogger } from "@/shared/services/logger/config";

export interface WorkerConfig {
  maxRestarts?: number;
  restartDelay?: number;
  timeout?: number;
}

export class WorkerManager {
  private worker: Electron.UtilityProcess | null = null;
  private running = false;
  private restartCount = 0;
  private config: Required<WorkerConfig>;
  private messageCallbacks = new Map<string, (response: any) => void>();
  private logger = getLogger("worker-manager");

  constructor(config: WorkerConfig = {}) {
    this.config = {
      maxRestarts: config.maxRestarts ?? 5,
      restartDelay: config.restartDelay ?? 1000,
      timeout: config.timeout ?? 30000,
    };
  }

  async startWorker(): Promise<void> {
    if (this.running) {
      this.logger.info("🔄 Worker is already running");
      return;
    }

    try {
      this.logger.info("🚀 Starting worker process...");
      this.running = true;
      this.restartCount = 0;

      await this.spawnWorker();
    } catch (error) {
      this.logger.error("💥 Failed to start worker:", error);
      this.running = false;
      throw error;
    }
  }

  async stopWorker(): Promise<void> {
    this.logger.info("🛑 Stopping worker...");
    this.running = false;

    if (this.worker) {
      try {
        // Gracefully terminate the worker
        this.worker.kill();
        this.worker = null;
        this.logger.info("✅ Worker stopped successfully");
      } catch (error) {
        this.logger.error("❌ Error stopping worker:", error);
      }
    }
  }

  async restartWorker(): Promise<void> {
    this.logger.info("🔄 Restarting worker...");
    await this.stopWorker();
    await this.delay(this.config.restartDelay);
    await this.startWorker();
  }

  isRunning(): boolean {
    return this.running && this.worker !== null;
  }

  getWorkerPid(): number | undefined {
    return this.worker?.pid;
  }

  private async spawnWorker(): Promise<void> {
    try {
      // Path to the built worker file - same pattern as preload
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const workerPath = path.join(currentDir, "worker.js");

      this.logger.info(`🔧 Spawning worker from: ${workerPath}`);

      this.worker = utilityProcess.fork(workerPath, [], {
        serviceName: "job-worker",
        stdio: "pipe", // Capture stdout/stderr
      });

      // Set up event handlers
      this.setupWorkerEventHandlers();

      this.logger.info(
        `✅ Worker spawned successfully (PID: ${this.worker.pid})`,
      );
    } catch (error) {
      this.logger.error("💥 Failed to spawn worker:", error);
      throw error;
    }
  }

  private setupWorkerEventHandlers(): void {
    if (!this.worker) return;

    // Handle worker exit
    this.worker.on("exit", (code: number) => {
      this.logger.info(`🔄 Worker exited with code: ${code}`);
      this.worker = null;

      // Auto-restart if still running and within restart limits
      if (this.running && this.restartCount < this.config.maxRestarts) {
        this.restartCount++;
        this.logger.info(
          `🔄 Auto-restarting worker (attempt ${this.restartCount}/${this.config.maxRestarts})`,
        );

        setTimeout(() => {
          if (this.running) {
            this.spawnWorker().catch((error) => {
              this.logger.error("💥 Failed to auto-restart worker:", error);
              this.running = false;
            });
          }
        }, this.config.restartDelay);
      } else if (this.restartCount >= this.config.maxRestarts) {
        this.logger.error(
          `💥 Worker restart limit reached (${this.config.maxRestarts}). Stopping.`,
        );
        this.running = false;
      }
    });

    // Handle worker spawn failure
    this.worker.on("spawn", () => {
      this.logger.info("🎯 Worker spawned successfully");
      this.restartCount = 0; // Reset restart count on successful spawn
    });

    // Worker uses structured logging - pipe stdout/stderr directly to avoid duplicate logs
    // The worker's Pino logger will handle proper formatting and context
    this.worker.stdout?.pipe(process.stdout);
    this.worker.stderr?.pipe(process.stderr);

    // Handle IPC messages from worker
    this.worker.on("message", async (message: any) => {
      this.logger.info("📨 Worker message received:", message);
      
      // Check if this is a domain operation request from worker
      if (message.requestId && message.action) {
        this.logger.info("📨 Processing domain operation request from worker:", message.action);
        await this.handleWorkerRequest(message);
        return;
      }
      
      // Otherwise, handle as regular response callback
      this.logger.info(`📨 Active callbacks: ${this.messageCallbacks.size}`);
      this.messageCallbacks.forEach((callback, messageId) => {
        this.logger.info(`📨 Calling callback for messageId: ${messageId}`);
        callback(message);
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle domain operation requests from worker
   */
  private async handleWorkerRequest(message: {
    requestId: string;
    action: string;
    payload: any;
  }): Promise<void> {
    const { requestId, action, payload } = message;
    
    try {
      let result: any;
      
      switch (action) {
        case "getDecryptedApiKey":
          result = await this.handleGetDecryptedApiKey(payload);
          break;
          
        default:
          throw new Error(`Unknown worker request action: ${action}`);
      }
      
      // Send successful response back to worker
      const response = {
        success: true,
        result,
        requestId,
      };
      
      this.logger.info("📨 Sending response back to worker:", response);
      this.worker?.postMessage(response);
      
    } catch (error) {
      // Send error response back to worker
      const response = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        requestId,
      };
      
      this.logger.error("📨 Sending error response back to worker:", response);
      this.worker?.postMessage(response);
    }
  }

  /**
   * Handle decrypted API key request from worker
   */
  private async handleGetDecryptedApiKey(payload: {
    providerId: string;
    ownerId: string;
  }): Promise<{ apiKey: string }> {
    const { getDecryptedApiKey } = await import("@/main/ipc/llm-provider/queries");
    
    const decryptedApiKey = await getDecryptedApiKey(
      payload.providerId,
      payload.ownerId,
    );
    
    return { apiKey: decryptedApiKey };
  }

  // Send message and get response
  async sendMessageWithResponse(
    message: any,
    timeoutMs: number = 30000,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(`[WorkerManager] Sending message to worker:`, message);

      if (!this.worker) {
        this.logger.error(`[WorkerManager] Worker not running`);
        reject(new Error("Worker not running"));
        return;
      }

      const messageId = Date.now().toString();
      this.logger.info(`[WorkerManager] Generated messageId: ${messageId}`);

      // Set up timeout
      const timeout = setTimeout(() => {
        this.logger.error(
          `[WorkerManager] Message timeout for messageId: ${messageId}`,
        );
        this.messageCallbacks.delete(messageId);
        reject(new Error("Message timeout"));
      }, timeoutMs);

      // Set up response handler
      this.messageCallbacks.set(messageId, (response: any) => {
        this.logger.info(
          `[WorkerManager] Received response for messageId ${messageId}:`,
          response,
        );
        clearTimeout(timeout);
        this.messageCallbacks.delete(messageId);

        if (response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response.error));
        }
      });

      // Send message to worker
      try {
        this.logger.info(`[WorkerManager] Posting message to worker`);
        this.worker.postMessage(message);
        this.logger.info(`[WorkerManager] Message posted successfully`);
      } catch (error) {
        this.logger.error(`[WorkerManager] Error posting message:`, error);
        clearTimeout(timeout);
        this.messageCallbacks.delete(messageId);
        reject(error);
      }
    });
  }

  // Utility method to send messages to worker (for simple fire-and-forget)
  sendMessage(message: any): boolean {
    if (this.worker) {
      try {
        this.worker.postMessage(message);
        return true;
      } catch (error) {
        this.logger.error("❌ Failed to send message to worker:", error);
        return false;
      }
    }
    return false;
  }

  // Get worker status for monitoring
  getStatus(): {
    running: boolean;
    pid?: number;
    restartCount: number;
    maxRestarts: number;
  } {
    return {
      running: this.running,
      pid: this.getWorkerPid(),
      restartCount: this.restartCount,
      maxRestarts: this.config.maxRestarts,
    };
  }
}

// Global instance for the application
export const workerManager = new WorkerManager({
  maxRestarts: 5,
  restartDelay: 2000, // 2 seconds
  timeout: 30000, // 30 seconds
});

// Utility functions for external usage
export const startWorker = () => workerManager.startWorker();
export const stopWorker = () => workerManager.stopWorker();
export const restartWorker = () => workerManager.restartWorker();
export const isWorkerRunning = () => workerManager.isRunning();
export const getWorkerStatus = () => workerManager.getStatus();
