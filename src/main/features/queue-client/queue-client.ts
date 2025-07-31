/**
 * Simple Queue Client - BullMQ-like API for worker communication
 */

import { workerManager } from "@/main/workers/worker-manager";
import type { JobOptions, Job } from "@/worker/queue/job.types";

export class QueueClient {
  private queueName: string;

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
    return workerManager.sendMessageWithResponse(message);
  }
}