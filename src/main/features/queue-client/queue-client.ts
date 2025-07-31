/**
 * Simple Queue Client - BullMQ-like API for worker communication
 */

import { workerManager } from "@/main/workers/worker-manager";

export class QueueClient {
  private queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async add(jobName: string, data: any, opts: any = {}): Promise<{ id: string }> {
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

  async getWaiting(): Promise<any[]> {
    const message = {
      action: "getWaiting",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  async getCompleted(): Promise<any[]> {
    const message = {
      action: "getCompleted",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  async getFailed(): Promise<any[]> {
    const message = {
      action: "getFailed",
      queueName: this.queueName,
    };

    return this.sendMessage(message);
  }

  private async sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!workerManager.isRunning()) {
        reject(new Error("Worker is not running"));
        return;
      }

      // Listen for response
      const messageListener = (response: any) => {
        if (response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response.error));
        }
      };

      // Send message
      const success = workerManager.sendMessage(message);
      if (!success) {
        reject(new Error("Failed to send message to worker"));
      }
    });
  }
}