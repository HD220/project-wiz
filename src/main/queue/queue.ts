import { eq, and, asc, desc, lt } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

import { jobsTable, type Job } from "@/main/schemas/job.schema";

const { getDatabase } = createDatabaseConnection(true);

export interface JobOptions {
  priority?: number;
  delay?: number; // Delay in milliseconds
  attempts?: number;
}

export interface AddJobResult {
  id: string;
}

// Simplified Queue for single worker with 15 concurrent jobs
export class Queue {
  private logger = getLogger("queue");
  
  constructor(public readonly name: string) {
    this.logger.debug(`Queue created: ${name}`);
  }

  // Add job to queue (BullMQ style with corrected delay)
  async add(
    data: any, 
    opts: JobOptions = {}
  ): Promise<AddJobResult> {
    const db = getDatabase();
    const now = Date.now();
    
    // Calculate when job should be executed
    const delayMs = opts.delay || 0;
    const scheduledFor = delayMs > 0 ? new Date(now + delayMs) : null;
    
    const [job] = await db
      .insert(jobsTable)
      .values({
        queueName: this.name,
        data: JSON.stringify(data),
        opts: JSON.stringify(opts),
        priority: opts.priority || 0,
        maxAttempts: opts.attempts || 3,
        delayMs,
        scheduledFor,
        status: scheduledFor ? "delayed" : "waiting",
      })
      .returning();

    if (!job) {
      throw new Error("Failed to create job");
    }

    this.logger.debug(`Job added to queue ${this.name}: ${job.id}${scheduledFor ? ` (delayed ${delayMs}ms)` : ""}`);
    return { id: job.id };
  }

  // Get waiting jobs (ready to process)
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

  // Get active jobs (currently processing)
  async getActive(): Promise<Job[]> {
    const db = getDatabase();
    
    return await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "active")
        )
      )
      .orderBy(asc(jobsTable.processedOn));
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

  // Get delayed jobs
  async getDelayed(): Promise<Job[]> {
    const db = getDatabase();
    
    return await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, "delayed")
        )
      )
      .orderBy(asc(jobsTable.scheduledFor));
  }

  // Get comprehensive queue stats
  async getStats() {
    const db = getDatabase();
    
    // Single query with count for better performance
    const stats = await db
      .select({
        status: jobsTable.status,
        count: jobsTable.id
      })
      .from(jobsTable)
      .where(eq(jobsTable.queueName, this.name));

    const result = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };

    // Count each status
    for (const stat of stats) {
      result[stat.status] = (result[stat.status] || 0) + 1;
    }

    return result;
  }

  // Clean old jobs (with proper grace period)
  async clean(gracePeriodMs: number, status: "completed" | "failed") {
    const db = getDatabase();
    const cutoffTime = new Date(Date.now() - gracePeriodMs);
    
    const result = await db
      .delete(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.name),
          eq(jobsTable.status, status),
          // Only clean jobs older than grace period
          status === "completed" || status === "failed" ? 
            lt(jobsTable.finishedOn, cutoffTime) : 
            lt(jobsTable.createdAt, cutoffTime)
        )
      );

    this.logger.debug(`Cleaned ${result.changes} ${status} jobs from ${this.name} (older than ${gracePeriodMs}ms)`);
    return result.changes || 0;
  }
}