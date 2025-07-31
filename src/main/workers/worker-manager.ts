// Simple worker manager using utilityProcess.fork for LLM job processing
// Based on final architecture decision - single worker with automatic restart

import { utilityProcess } from "electron";
import path from "path";

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

  constructor(config: WorkerConfig = {}) {
    this.config = {
      maxRestarts: config.maxRestarts ?? 5,
      restartDelay: config.restartDelay ?? 1000,
      timeout: config.timeout ?? 30000,
    };
  }

  async startWorker(): Promise<void> {
    if (this.running) {
      console.log("🔄 Worker is already running");
      return;
    }

    try {
      console.log("🚀 Starting LLM worker process...");
      this.running = true;
      this.restartCount = 0;

      await this.spawnWorker();
    } catch (error) {
      console.error("💥 Failed to start worker:", error);
      this.running = false;
      throw error;
    }
  }

  async stopWorker(): Promise<void> {
    console.log("🛑 Stopping LLM worker...");
    this.running = false;

    if (this.worker) {
      try {
        // Gracefully terminate the worker
        this.worker.kill();
        this.worker = null;
        console.log("✅ Worker stopped successfully");
      } catch (error) {
        console.error("❌ Error stopping worker:", error);
      }
    }
  }

  async restartWorker(): Promise<void> {
    console.log("🔄 Restarting LLM worker...");
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
      // Path to the built worker file
      const workerPath = path.join(__dirname, "../worker/worker.js");
      
      console.log(`🔧 Spawning worker from: ${workerPath}`);

      this.worker = utilityProcess.fork(workerPath, [], {
        serviceName: "llm-worker",
        stdio: "pipe", // Capture stdout/stderr
      });

      // Set up event handlers
      this.setupWorkerEventHandlers();

      console.log(`✅ Worker spawned successfully (PID: ${this.worker.pid})`);
    } catch (error) {
      console.error("💥 Failed to spawn worker:", error);
      throw error;
    }
  }

  private setupWorkerEventHandlers(): void {
    if (!this.worker) return;

    // Handle worker exit
    this.worker.on("exit", (code: number) => {
      console.log(`🔄 Worker exited with code: ${code}`);
      this.worker = null;

      // Auto-restart if still running and within restart limits
      if (this.running && this.restartCount < this.config.maxRestarts) {
        this.restartCount++;
        console.log(`🔄 Auto-restarting worker (attempt ${this.restartCount}/${this.config.maxRestarts})`);
        
        setTimeout(() => {
          if (this.running) {
            this.spawnWorker().catch((error) => {
              console.error("💥 Failed to auto-restart worker:", error);
              this.running = false;
            });
          }
        }, this.config.restartDelay);
      } else if (this.restartCount >= this.config.maxRestarts) {
        console.error(`💥 Worker restart limit reached (${this.config.maxRestarts}). Stopping.`);
        this.running = false;
      }
    });

    // Handle worker spawn failure
    this.worker.on("spawn", () => {
      console.log("🎯 Worker spawned successfully");
      this.restartCount = 0; // Reset restart count on successful spawn
    });

    // Handle stdout (worker logs)
    this.worker.stdout?.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`[WORKER] ${message}`);
      }
    });

    // Handle stderr (worker errors)
    this.worker.stderr?.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      if (message) {
        console.error(`[WORKER ERROR] ${message}`);
      }
    });

    // Handle IPC messages (optional - for future use)
    this.worker.on("message", (message: any) => {
      console.log("📨 Worker message:", message);
      // TODO: Handle worker messages if needed in the future
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility method to send messages to worker (for future use)
  sendMessage(message: any): boolean {
    if (this.worker) {
      try {
        this.worker.postMessage(message);
        return true;
      } catch (error) {
        console.error("❌ Failed to send message to worker:", error);
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
export const startLLMWorker = () => workerManager.startWorker();
export const stopLLMWorker = () => workerManager.stopWorker();
export const restartLLMWorker = () => workerManager.restartWorker();
export const isLLMWorkerRunning = () => workerManager.isRunning();
export const getLLMWorkerStatus = () => workerManager.getStatus();