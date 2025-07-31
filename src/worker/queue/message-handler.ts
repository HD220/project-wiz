/**
 * Simple Worker Message Handler
 */

import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "../database";
import { jobsTable } from "./job.model";
import type { JobOptions } from "./job.types";

export class MessageHandler {
  async handleMessage(message: any): Promise<any> {
    const { action, queueName, ...data } = message;

    switch (action) {
      case "add":
        return this.addJob(queueName, data);
      case "getStats":
        return this.getStats(queueName);
      case "getWaiting":
        return this.getWaiting(queueName);
      case "getCompleted":
        return this.getCompleted(queueName);
      case "getFailed":
        return this.getFailed(queueName);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async addJob(queueName: string, data: { jobData: any; opts?: JobOptions }) {
    const jobId = crypto.randomUUID();
    const now = Date.now();

    await db.insert(jobsTable).values({
      id: jobId,
      name: queueName,
      data: JSON.stringify(data.jobData),
      opts: data.opts ? JSON.stringify(data.opts) : null,
      priority: data.opts?.priority || 0,
      status: "waiting",
      createdAt: new Date(now),
    });

    return { jobId };
  }

  private async getStats(queueName: string) {
    const jobs = await db
      .select({ status: jobsTable.status })
      .from(jobsTable)
      .where(eq(jobsTable.name, queueName));

    const stats = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 };
    jobs.forEach(job => stats[job.status as keyof typeof stats]++);
    
    return stats;
  }

  private async getWaiting(queueName: string) {
    const jobs = await db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.name, queueName), eq(jobsTable.status, "waiting")))
      .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt));

    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: JSON.parse(job.data),
      opts: job.opts ? JSON.parse(job.opts) : null,
    }));
  }

  private async getCompleted(queueName: string) {
    const jobs = await db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.name, queueName), eq(jobsTable.status, "completed")))
      .orderBy(desc(jobsTable.finishedOn));

    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: JSON.parse(job.data),
      result: job.result ? JSON.parse(job.result) : null,
    }));
  }

  private async getFailed(queueName: string) {
    const jobs = await db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.name, queueName), eq(jobsTable.status, "failed")))
      .orderBy(desc(jobsTable.finishedOn));

    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: JSON.parse(job.data),
      error: job.failureReason,
    }));
  }
}