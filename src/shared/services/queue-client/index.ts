/**
 * Simple Queue Client - BullMQ-like API for worker communication
 * Enhanced with EventEmitter capabilities for job lifecycle events
 */

import { EventEmitter } from "events";

import { workerManager } from "@/main/services/worker-manager";

import { getLogger } from "@/shared/services/logger/config";

import type { JobOptions, Job } from "@/worker/queue/job.types";

// Queue event types
export interface QueueEvents {
  "job-completed": {
    jobId: string;
    queueName: string;
    result: any;
    timestamp: Date;
  };
  "job-failed": {
    jobId: string;
    queueName: string;
    error: string;
    attempts: number;
    timestamp: Date;
  };
  "job-progress": {
    jobId: string;
    queueName: string;
    progress: number;
    timestamp: Date;
  };
}

export type QueueEventName = keyof QueueEvents;
export type QueueEventData<T extends QueueEventName> = QueueEvents[T];

export class QueueClient extends EventEmitter {
  private queueName: string;
  private logger = getLogger("queue-client");
  private pollingInterval: NodeJS.Timeout | null = null;
  private trackedJobs = new Map<
    string,
    { status: string; lastChecked: number }
  >();
  private isPolling = false;

  constructor(queueName: string) {
    super();
    this.queueName = queueName;
    this.setMaxListeners(20); // Allow multiple listeners
    this.setupWorkerCommunication();
    this.logger.info(`🔄 QueueClient initialized for queue: ${queueName}`);
  }

  async add(data: any, opts: JobOptions = {}): Promise<{ jobId: string }> {
    const message = {
      action: "add",
      queueName: this.queueName,
      jobData: data,
      opts,
    };

    this.logger.debug(`[QueueClient] Sending add job message:`, { message });
    const result = await this.sendMessage(message);

    // Start tracking this job
    if (result.jobId) {
      this.trackedJobs.set(result.jobId, {
        status: "waiting",
        lastChecked: Date.now(),
      });

      // Start polling if not already running
      this.startPolling();
    }

    return result;
  }

  async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const message = {
      action: "getStats",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  async getWaiting(): Promise<Job[]> {
    const message = {
      action: "getWaiting",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  async getCompleted(): Promise<Job[]> {
    const message = {
      action: "getCompleted",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  async getFailed(): Promise<Job[]> {
    const message = {
      action: "getFailed",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  /**
   * Setup worker communication using polling for job status changes
   */
  private setupWorkerCommunication(): void {
    this.logger.debug("🔧 Setting up worker communication with polling");

    // The polling will be started when jobs are added
    // and stopped when no jobs are being tracked

    this.logger.info("✅ Worker communication setup complete (polling-based)");
  }

  /**
   * Start polling for job status changes
   */
  private startPolling(): void {
    if (this.isPolling) {
      return; // Already polling
    }

    this.isPolling = true;
    this.pollingInterval = setInterval(() => {
      this.checkJobStatuses().catch((error) => {
        this.logger.error("❌ Error during job status polling:", error);
      });
    }, 30000); // Poll every 30 seconds

    this.logger.debug("🔄 Started job status polling");
  }

  /**
   * Stop polling for job status changes
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    this.logger.debug("🛑 Stopped job status polling");
  }

  /**
   * Check status of all tracked jobs and emit events for changes
   */
  private async checkJobStatuses(): Promise<void> {
    if (this.trackedJobs.size === 0) {
      this.stopPolling();
      return;
    }

    try {
      // Get completed jobs
      const completed = await this.getCompleted();
      const failed = await this.getFailed();

      // Check each tracked job
      const jobsToRemove: string[] = [];

      for (const [jobId, trackedJob] of this.trackedJobs) {
        // Check if job is completed
        const completedJob = completed.find((job) => job.id === jobId);
        if (completedJob) {
          if (trackedJob.status !== "completed") {
            this.emit("job-completed", {
              jobId,
              queueName: this.queueName,
              result: (completedJob as any).result || "Job completed",
              timestamp: new Date(),
            });
          }
          jobsToRemove.push(jobId);
          continue;
        }

        // Check if job has failed
        const failedJob = failed.find((job) => job.id === jobId);
        if (failedJob) {
          if (trackedJob.status !== "failed") {
            this.emit("job-failed", {
              jobId,
              queueName: this.queueName,
              error: (failedJob as any).error || "Unknown error",
              attempts: 1, // Could get actual attempts from job data
              timestamp: new Date(),
            });
          }
          jobsToRemove.push(jobId);
          continue;
        }

        // Update tracked job timestamp
        this.trackedJobs.set(jobId, {
          ...trackedJob,
          lastChecked: Date.now(),
        });
      }

      // Remove completed/failed jobs from tracking
      jobsToRemove.forEach((jobId) => {
        this.trackedJobs.delete(jobId);
      });

      // Stop polling if no jobs left to track
      if (this.trackedJobs.size === 0) {
        this.stopPolling();
      }
    } catch (error) {
      this.logger.error("❌ Error checking job statuses:", error);
    }
  }

  /**
   * Type-safe event emission for queue events
   */
  emit<T extends QueueEventName>(
    eventName: T,
    data: QueueEventData<T>,
  ): boolean {
    this.logger.debug(`📤 Emitting queue event: ${eventName}`, data);
    return super.emit(eventName, data);
  }

  /**
   * Type-safe event listener registration
   */
  on<T extends QueueEventName>(
    eventName: T,
    listener: (data: QueueEventData<T>) => void,
  ): this {
    this.logger.debug(`👂 Registering listener for queue event: ${eventName}`);
    return super.on(eventName, listener);
  }

  private async sendMessage(message: any): Promise<any> {
    this.logger.debug(
      `[QueueClient] Calling workerManager.sendMessageWithResponse`,
    );
    try {
      const result = await workerManager.sendMessageWithResponse(message);
      this.logger.debug(`[QueueClient] Got response from worker:`, result);
      return result;
    } catch (error) {
      this.logger.error(`[QueueClient] Error from worker:`, error);
      throw error;
    }
  }

  /**
   * Cleanup - remove all listeners and stop polling
   */
  public shutdown(): void {
    this.logger.info("🛑 QueueClient shutting down");

    // Stop polling
    this.stopPolling();

    // Clear tracked jobs
    this.trackedJobs.clear();

    // Remove all event listeners
    this.removeAllListeners();

    this.logger.info("✅ QueueClient shutdown complete");
  }
}
