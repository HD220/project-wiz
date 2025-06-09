import { SqliteQueue } from "../queue/sqlite.queue";
import { Worker } from "./worker.interface";
import { Job } from "../job/job";

export class SqliteWorker<T = unknown, R = unknown> extends Worker<T> {
  private running = false;
  private paused = false;
  private activeJobs = new Set<string>();

  constructor(
    private readonly queue: SqliteQueue<T>,
    private readonly handler: (job: T) => Promise<void>,
    private readonly retryDelay = 5000
  ) {
    if (!queue) throw new Error("Queue is required");
    if (!handler) throw new Error("Handler is required");
  }

  private async process(job: Job<T>) {
    if (this.paused || !this.running) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }

    this.activeJobs.add(job.id);
    try {
      await this.handler(job.data.payload);
      await job.complete();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      if (job.data.attempts < job.data.maxAttempts) {
        await job.fail(reason);
        await job.delay(this.retryDelay);
      } else {
        await job.fail(reason);
      }
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.running = true;
    this.paused = false;

    while (this.running) {
      if (this.paused) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      const job = await this.queue.getNextJob();
      if (job) {
        await this.process(job);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async pause(): Promise<void> {
    this.paused = true;
  }

  async resume(): Promise<void> {
    this.paused = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  getActiveJobs(): string[] {
    return Array.from(this.activeJobs);
  }

  getActiveJobsCount(): number {
    return this.activeJobs.size;
  }
}
