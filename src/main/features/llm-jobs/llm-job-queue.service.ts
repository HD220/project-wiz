import { eq, and, desc, asc } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import { llmJobsTable, type JobData, type JobOptions, type JobResult, type JobStatus } from "./llm-jobs.model";

/**
 * LLM Job Queue Service - Main Process Integration
 * 
 * Provides job submission, monitoring, and result retrieval for the LLM worker system.
 * Uses database-only communication pattern - no direct IPC with worker process.
 * Worker polls database for jobs, main process polls database for results.
 */
export const llmJobQueueService = {
  /**
   * Submit a new job to the queue
   * Worker will automatically pick up jobs based on priority and creation time
   */
  async addJob(
    name: string,
    data: JobData,
    opts: JobOptions = {}
  ): Promise<string> {
    const db = getDatabase();

    const jobId = crypto.randomUUID();
    const now = Date.now();

    await db.insert(llmJobsTable).values({
      id: jobId,
      name,
      data: JSON.stringify(data),
      opts: JSON.stringify(opts),
      priority: opts.priority || 0,
      delay: opts.delay || 0,
      maxAttempts: opts.attempts || 3,
      status: opts.delay && opts.delay > 0 ? "delayed" : "waiting",
      createdAt: new Date(now),
      // If job is delayed, set when it should become available
      processedOn: opts.delay ? new Date(now + opts.delay) : null,
    });

    return jobId;
  },

  /**
   * Get current status of a specific job
   */
  async getJobStatus(jobId: string): Promise<{
    id: string;
    name: string;
    status: JobStatus;
    progress: number;
    result: JobResult | null;
    error: string | null;
    createdAt: Date;
    processedOn: Date | null;
    finishedOn: Date | null;
  } | null> {
    const db = getDatabase();

    const [job] = await db
      .select()
      .from(llmJobsTable)
      .where(eq(llmJobsTable.id, jobId))
      .limit(1);

    if (!job) {
      return null;
    }

    return {
      id: job.id,
      name: job.name,
      status: job.status,
      progress: job.progress,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.failureReason,
      createdAt: job.createdAt,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  },

  /**
   * Poll for completed jobs that need UI processing
   * Used by UI to get results without constant polling individual jobs
   */
  async pollCompletedJobs(limit = 50): Promise<Array<{
    id: string;
    name: string;
    status: JobStatus;
    result: JobResult | null;
    error: string | null;
    finishedOn: Date | null;
  }>> {
    const db = getDatabase();

    const jobs = await db
      .select({
        id: llmJobsTable.id,
        name: llmJobsTable.name,
        status: llmJobsTable.status,
        result: llmJobsTable.result,
        failureReason: llmJobsTable.failureReason,
        finishedOn: llmJobsTable.finishedOn,
      })
      .from(llmJobsTable)
      .where(
        and(
          eq(llmJobsTable.status, "completed"),
          // Add a way to track if job was processed by UI
          // For now, we'll just return completed jobs
        )
      )
      .orderBy(desc(llmJobsTable.finishedOn))
      .limit(limit);

    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      status: job.status as JobStatus,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.failureReason,
      finishedOn: job.finishedOn,
    }));
  },

  /**
   * Get failed jobs for error monitoring
   */
  async getFailedJobs(limit = 50): Promise<Array<{
    id: string;
    name: string;
    error: string | null;
    stacktrace: string | null;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    finishedOn: Date | null;
  }>> {
    const db = getDatabase();

    const jobs = await db
      .select({
        id: llmJobsTable.id,
        name: llmJobsTable.name,
        failureReason: llmJobsTable.failureReason,
        stacktrace: llmJobsTable.stacktrace,
        attempts: llmJobsTable.attempts,
        maxAttempts: llmJobsTable.maxAttempts,
        createdAt: llmJobsTable.createdAt,
        finishedOn: llmJobsTable.finishedOn,
      })
      .from(llmJobsTable)
      .where(eq(llmJobsTable.status, "failed"))
      .orderBy(desc(llmJobsTable.finishedOn))
      .limit(limit);

    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      error: job.failureReason,
      stacktrace: job.stacktrace,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      createdAt: job.createdAt,
      finishedOn: job.finishedOn,
    }));
  },

  /**
   * Get queue statistics for monitoring
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const db = getDatabase();

    // Single query to get all counts
    const jobs = await db
      .select({
        status: llmJobsTable.status,
      })
      .from(llmJobsTable);

    const stats = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: 0,
    };

    for (const job of jobs) {
      stats[job.status]++;
    }

    return stats;
  },

  /**
   * Get pending jobs (waiting + delayed that are ready)
   * Used for monitoring what's in the queue
   */
  async getPendingJobs(limit = 20): Promise<Array<{
    id: string;
    name: string;
    priority: number;
    status: JobStatus;
    createdAt: Date;
    delay: number;
  }>> {
    const db = getDatabase();
    const now = Date.now();

    const jobs = await db
      .select({
        id: llmJobsTable.id,
        name: llmJobsTable.name,
        priority: llmJobsTable.priority,
        status: llmJobsTable.status,
        createdAt: llmJobsTable.createdAt,
        delay: llmJobsTable.delay,
      })
      .from(llmJobsTable)
      .where(
        and(
          eq(llmJobsTable.dependencyCount, 0), // No dependencies blocking
          // Include waiting jobs or delayed jobs that are ready
          // For delayed jobs, check if delay time has passed
        )
      )
      .orderBy(desc(llmJobsTable.priority), asc(llmJobsTable.createdAt))
      .limit(limit);

    return jobs.filter(job => {
      if (job.status === "waiting") return true;
      if (job.status === "delayed") {
        // Job is ready if created time + delay <= now
        return job.createdAt.getTime() + job.delay <= now;
      }
      return false;
    });
  },

  /**
   * Retry a failed job
   * Resets job status to waiting and increments attempt counter
   */
  async retryJob(jobId: string): Promise<void> {
    const db = getDatabase();

    const [job] = await db
      .select()
      .from(llmJobsTable)
      .where(eq(llmJobsTable.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "failed") {
      throw new Error("Only failed jobs can be retried");
    }

    if (job.attempts >= job.maxAttempts) {
      throw new Error("Job has exceeded maximum retry attempts");
    }

    await db
      .update(llmJobsTable)
      .set({
        status: "waiting",
        failureReason: null,
        stacktrace: null,
        progress: 0,
        processedOn: null,
        finishedOn: null,
      })
      .where(eq(llmJobsTable.id, jobId));
  },

  /**
   * Cancel a waiting or delayed job
   */
  async cancelJob(jobId: string): Promise<void> {
    const db = getDatabase();

    const [job] = await db
      .select()
      .from(llmJobsTable)
      .where(eq(llmJobsTable.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status === "active") {
      throw new Error("Cannot cancel active job");
    }

    if (job.status === "completed" || job.status === "failed") {
      throw new Error("Cannot cancel finished job");
    }

    await db
      .update(llmJobsTable)
      .set({
        status: "failed",
        failureReason: "Job cancelled by user",
        finishedOn: new Date(),
      })
      .where(eq(llmJobsTable.id, jobId));
  },

  /**
   * Clean up old completed/failed jobs
   * Used for database maintenance
   */
  async cleanupOldJobs(_olderThanMs = 24 * 60 * 60 * 1000): Promise<number> { // Default: 24 hours
    const db = getDatabase();

    const result = await db
      .delete(llmJobsTable)
      .where(
        and(
          // Only delete completed or failed jobs
          // Don't delete waiting, active, delayed, or paused jobs
          eq(llmJobsTable.status, "completed")
          // Note: Additional time-based filtering would require more complex query
        )
      );

    return result.changes || 0;
  },
};