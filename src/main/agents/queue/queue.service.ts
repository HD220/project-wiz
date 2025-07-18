import { EventEmitter } from "events";
import { z } from "zod";

// Simple ID generator
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Job validation schema
const JobSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "code_implementation",
    "code_review",
    "testing",
    "documentation",
    "bug_fix",
  ]),
  description: z.string().min(1).max(1000),
  projectId: z.string(),
  channelId: z.string().optional(),
  assignedAgentId: z.string(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  metadata: z.record(z.any()).optional(),
  createdBy: z.string(),
});

export type Job = z.infer<typeof JobSchema> & {
  id: string;
  status: JobStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
};

export type JobStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export type CreateJobInput = z.infer<typeof JobSchema>;

/**
 * Simple in-memory queue service for agent jobs
 * KISS approach: Simple, focused, and reliable
 */
class QueueService extends EventEmitter {
  private queues: Map<string, Job[]> = new Map(); // agentId -> jobs
  private runningJobs: Map<string, Job> = new Map(); // jobId -> job
  private jobHistory: Map<string, Job> = new Map(); // jobId -> job

  /**
   * Add job to agent's queue
   */
  async enqueueJob(input: CreateJobInput): Promise<Job> {
    // Validate input
    const validated = JobSchema.parse(input);

    // Create job
    const job: Job = {
      ...validated,
      id: validated.id || generateJobId(),
      status: "queued",
      createdAt: new Date(),
    };

    // Add to agent's queue
    const agentQueue = this.queues.get(validated.assignedAgentId) || [];
    agentQueue.push(job);
    this.queues.set(validated.assignedAgentId, agentQueue);

    // Store in history
    this.jobHistory.set(job.id, job);

    // Emit event
    this.emit("job:enqueued", job);

    return job;
  }

  /**
   * Get next job for agent
   */
  async getNextJob(agentId: string): Promise<Job | null> {
    const agentQueue = this.queues.get(agentId);
    if (!agentQueue || agentQueue.length === 0) {
      return null;
    }

    // Sort by priority (high -> medium -> low) and creation time
    agentQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const job = agentQueue.shift();
    if (!job) return null;

    // Update job status
    job.status = "in_progress";
    job.startedAt = new Date();

    // Move to running jobs
    this.runningJobs.set(job.id, job);

    // Emit event
    this.emit("job:started", job);

    return job;
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, result?: any): Promise<void> {
    const job = this.runningJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in running jobs`);
    }

    // Update job
    job.status = "completed";
    job.completedAt = new Date();
    job.result = result;

    // Remove from running jobs
    this.runningJobs.delete(jobId);

    // Update history
    this.jobHistory.set(jobId, job);

    // Emit event
    this.emit("job:completed", job);
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, error: string): Promise<void> {
    const job = this.runningJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in running jobs`);
    }

    // Update job
    job.status = "failed";
    job.completedAt = new Date();
    job.error = error;

    // Remove from running jobs
    this.runningJobs.delete(jobId);

    // Update history
    this.jobHistory.set(jobId, job);

    // Emit event
    this.emit("job:failed", job);
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    // Try to find in running jobs first
    const runningJob = this.runningJobs.get(jobId);
    if (runningJob) {
      runningJob.status = "cancelled";
      runningJob.completedAt = new Date();
      this.runningJobs.delete(jobId);
      this.jobHistory.set(jobId, runningJob);
      this.emit("job:cancelled", runningJob);
      return;
    }

    // Try to find in queues
    for (const [agentId, queue] of this.queues.entries()) {
      const jobIndex = queue.findIndex((job) => job.id === jobId);
      if (jobIndex !== -1) {
        const job = queue[jobIndex];
        if (job) {
          job.status = "cancelled";
          job.completedAt = new Date();
          queue.splice(jobIndex, 1);
          this.queues.set(agentId, queue);
          this.jobHistory.set(jobId, job);
          this.emit("job:cancelled", job);
          return;
        }
      }
    }

    throw new Error(`Job ${jobId} not found`);
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    // Check running jobs first
    const runningJob = this.runningJobs.get(jobId);
    if (runningJob) return runningJob;

    // Check history
    const historicalJob = this.jobHistory.get(jobId);
    if (historicalJob) return historicalJob;

    // Check queues
    for (const queue of this.queues.values()) {
      const job = queue.find((job) => job.id === jobId);
      if (job) return job;
    }

    return null;
  }

  /**
   * Get all jobs for an agent
   */
  async getJobsForAgent(agentId: string): Promise<Job[]> {
    const queuedJobs = this.queues.get(agentId) || [];
    const runningJobs = Array.from(this.runningJobs.values()).filter(
      (job) => job.assignedAgentId === agentId,
    );
    const historicalJobs = Array.from(this.jobHistory.values()).filter(
      (job) => job.assignedAgentId === agentId,
    );

    return [...queuedJobs, ...runningJobs, ...historicalJobs];
  }

  /**
   * Get all jobs for a project
   */
  async getJobsForProject(projectId: string): Promise<Job[]> {
    const allJobs: Job[] = [];

    // Get from queues
    for (const queue of this.queues.values()) {
      allJobs.push(...queue.filter((job) => job.projectId === projectId));
    }

    // Get from running jobs
    allJobs.push(
      ...Array.from(this.runningJobs.values()).filter(
        (job) => job.projectId === projectId,
      ),
    );

    // Get from history
    allJobs.push(
      ...Array.from(this.jobHistory.values()).filter(
        (job) => job.projectId === projectId,
      ),
    );

    return allJobs;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    totalQueued: number;
    totalRunning: number;
    totalCompleted: number;
    totalFailed: number;
    agentQueues: { agentId: string; queueSize: number }[];
  }> {
    const totalQueued = Array.from(this.queues.values()).reduce(
      (sum, queue) => sum + queue.length,
      0,
    );

    const totalRunning = this.runningJobs.size;

    const historicalJobs = Array.from(this.jobHistory.values());
    const totalCompleted = historicalJobs.filter(
      (job) => job.status === "completed",
    ).length;
    const totalFailed = historicalJobs.filter(
      (job) => job.status === "failed",
    ).length;

    const agentQueues = Array.from(this.queues.entries()).map(
      ([agentId, queue]) => ({
        agentId,
        queueSize: queue.length,
      }),
    );

    return {
      totalQueued,
      totalRunning,
      totalCompleted,
      totalFailed,
      agentQueues,
    };
  }

  /**
   * Clear completed jobs from history (cleanup)
   */
  async cleanupHistory(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let removedCount = 0;
    for (const [jobId, job] of this.jobHistory.entries()) {
      if (job.completedAt && job.completedAt < cutoffDate) {
        this.jobHistory.delete(jobId);
        removedCount++;
      }
    }

    return removedCount;
  }
}

// Export singleton instance
export const queueService = new QueueService();

// Export helper functions
export async function enqueueJob(input: CreateJobInput): Promise<Job> {
  return queueService.enqueueJob(input);
}

export async function getNextJob(agentId: string): Promise<Job | null> {
  return queueService.getNextJob(agentId);
}

export async function completeJob(jobId: string, result?: any): Promise<void> {
  return queueService.completeJob(jobId, result);
}

export async function failJob(jobId: string, error: string): Promise<void> {
  return queueService.failJob(jobId, error);
}

export async function cancelJob(jobId: string): Promise<void> {
  return queueService.cancelJob(jobId);
}

export async function getJob(jobId: string): Promise<Job | null> {
  return queueService.getJob(jobId);
}

export async function getJobsForAgent(agentId: string): Promise<Job[]> {
  return queueService.getJobsForAgent(agentId);
}

export async function getJobsForProject(projectId: string): Promise<Job[]> {
  return queueService.getJobsForProject(projectId);
}

export async function getQueueStats(): Promise<{
  totalQueued: number;
  totalRunning: number;
  totalCompleted: number;
  totalFailed: number;
  agentQueues: { agentId: string; queueSize: number }[];
}> {
  return queueService.getQueueStats();
}
