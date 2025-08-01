/**
 * Simple Queue Client - BullMQ-like API for worker communication
 */

import { workerManager } from "@/main/workers/worker-manager";
import type { JobOptions, Job } from "@/worker/queue/job.types";
import { getLogger } from "@/shared/logger/config";

export class QueueClient {
  private queueName: string;
  private logger = getLogger("queue-client");

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async add(data: any, opts: JobOptions = {}): Promise<{ jobId: string }> {
    const message = {
      action: "add",
      queueName: this.queueName,
      jobData: data,
      opts,
    };

    this.logger.debug(`[QueueClient] Sending add job message:`, { message });
    return this.sendMessage(message);
  }

  async getJobCounts(): Promise<{ waiting: number; active: number; completed: number; failed: number; delayed: number; paused: number }> {
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

  private async sendMessage(message: any): Promise<any> {
    this.logger.debug(`[QueueClient] Calling workerManager.sendMessageWithResponse`);
    try {
      const result = await workerManager.sendMessageWithResponse(message);
      this.logger.debug(`[QueueClient] Got response from worker:`, result);
      return result;
    } catch (error) {
      this.logger.error(`[QueueClient] Error from worker:`, error);
      throw error;
    }
  }
}