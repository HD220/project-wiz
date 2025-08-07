/**
 * Simple Worker Message Handler
 */

import { eq, and, desc, asc } from "drizzle-orm";

import { jobsTable } from "@/worker/schemas/job.schema";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

import type { JobOptions } from "./job.types";

const { getDatabase } = createDatabaseConnection(true);

export class MessageHandler {
  private logger = getLogger("worker-message-handler");
  async handleMessage(message: any): Promise<any> {
    this.logger.debug("🟡 [MessageHandler] Processing message:", message);
    const { action, queueName, ...data } = message;
    this.logger.debug("🟡 [MessageHandler] Extracted:", {
      action,
      queueName,
      data,
    });

    switch (action) {
      case "add":
        this.logger.debug("🟡 [MessageHandler] Handling 'add' action");
        return this.addJob(queueName, data);
      case "getStats":
        this.logger.debug("🟡 [MessageHandler] Handling 'getStats' action");
        return this.getStats(queueName);
      case "getWaiting":
        this.logger.debug("🟡 [MessageHandler] Handling 'getWaiting' action");
        return this.getWaiting(queueName);
      case "getCompleted":
        this.logger.debug("🟡 [MessageHandler] Handling 'getCompleted' action");
        return this.getCompleted(queueName);
      case "getFailed":
        this.logger.debug("🟡 [MessageHandler] Handling 'getFailed' action");
        return this.getFailed(queueName);
      default:
        this.logger.error("🟡 [MessageHandler] Unknown action:", action);
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async addJob(
    queueName: string,
    data: { jobData: any; opts?: JobOptions },
  ) {
    this.logger.debug(
      "🟢 [MessageHandler] Adding job to queue:",
      queueName,
      "with data:",
      data,
    );

    const jobId = crypto.randomUUID();
    const now = Date.now();

    this.logger.debug("🟢 [MessageHandler] Generated jobId:", jobId);

    try {
      const jobValues = {
        id: jobId,
        name: queueName,
        data: JSON.stringify(data.jobData),
        opts: data.opts ? JSON.stringify(data.opts) : null,
        priority: data.opts?.priority || 0,
        status: "waiting" as const,
        dependencyCount: 0, // Explicitly set to 0
        createdAt: new Date(now),
      };

      this.logger.debug("🟢 [MessageHandler] Inserting job with values:", {
        id: jobId.substring(0, 8),
        name: queueName,
        priority: jobValues.priority,
        status: jobValues.status,
        dependencyCount: jobValues.dependencyCount,
      });

      await getDatabase().insert(jobsTable).values(jobValues);

      this.logger.debug(
        "🟢 [MessageHandler] Job inserted successfully into database",
      );
      return { jobId };
    } catch (error) {
      this.logger.error("🟢 [MessageHandler] Error inserting job:", error);
      throw error;
    }
  }

  private async getStats(queueName: string) {
    const jobs = await getDatabase()
      .select({ status: jobsTable.status })
      .from(jobsTable)
      .where(eq(jobsTable.name, queueName));

    const stats = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: 0,
    };
    jobs.forEach((job) => stats[job.status as keyof typeof stats]++);

    return stats;
  }

  private async getWaiting(queueName: string) {
    const jobs = await getDatabase()
      .select()
      .from(jobsTable)
      .where(
        and(eq(jobsTable.name, queueName), eq(jobsTable.status, "waiting")),
      )
      .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt));

    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: JSON.parse(job.data),
      opts: job.opts ? JSON.parse(job.opts) : null,
    }));
  }

  private async getCompleted(queueName: string) {
    const jobs = await getDatabase()
      .select()
      .from(jobsTable)
      .where(
        and(eq(jobsTable.name, queueName), eq(jobsTable.status, "completed")),
      )
      .orderBy(desc(jobsTable.finishedOn));

    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: JSON.parse(job.data),
      result: job.result ? JSON.parse(job.result) : null,
    }));
  }

  private async getFailed(queueName: string) {
    const jobs = await getDatabase()
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.name, queueName), eq(jobsTable.status, "failed")))
      .orderBy(desc(jobsTable.finishedOn));

    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: JSON.parse(job.data),
      error: job.failureReason,
    }));
  }
}
