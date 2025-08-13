import { eq, and, asc, desc } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

import { jobsTable, type Job } from "@/main/schemas/job.schema";

const { getDatabase } = createDatabaseConnection(true);

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
}

export interface AddJobResult {
  id: string;
}

// Complete BullMQ-style Queue
export class Queue {
  private logger = getLogger("queue");
  
  constructor(public readonly name: string) {
    this.logger.debug(`Queue created: ${name}`);
  }

  // Add job to queue (BullMQ style)
  async add(
    data: any, 
    opts: JobOptions = {}
  ): Promise<AddJobResult> {
    const db = getDatabase();
    
    const [job] = await db
      .insert(jobsTable)
      .values({
        queueName: this.name,
        data: JSON.stringify(data),
        opts: JSON.stringify(opts),
        priority: opts.priority || 0,
        maxAttempts: opts.attempts || 3,
        delay: opts.delay || 0,
        status: opts.delay ? "delayed" : "waiting",
      })
      .returning();

    if (!job) {
      throw new Error("Failed to create job");
    }

    this.logger.debug(`Job added to queue ${this.name}:`, job.id);
    return { id: job.id };
  }

  // Get waiting jobs
  async getWaiting(): Promise<Job[]> {
    const db = getDatabase();
    
    return await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "waiting")
        )
      )
      .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt));
  }

  // Get completed jobs
  async getCompleted(): Promise<Job[]> {
    const db = getDatabase();
    
    return await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "completed")
        )
      )
      .orderBy(desc(jobsTable.finishedOn));
  }

  // Get failed jobs
  async getFailed(): Promise<Job[]> {
    const db = getDatabase();
    
    return await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "failed")
        )
      )
      .orderBy(desc(jobsTable.finishedOn));
  }

  // Get queue stats
  async getStats() {
    const db = getDatabase();
    
    const waiting = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "waiting")
        )
      );

    const completed = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "completed")
        )
      );

    const failed = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "failed")
        )
      );

    return {
      waiting: waiting.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  // Clean old jobs
  async clean(_grace: number, status: "completed" | "failed") {
    const db = getDatabase();
    
    const result = await db
      .delete(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, status)
        )
      );

    this.logger.debug(`Cleaned ${result.changes} ${status} jobs from ${this.name}`);
    return result.changes;
  }
}