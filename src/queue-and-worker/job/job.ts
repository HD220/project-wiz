import { Job as JobInterface, JobData, JobState } from "./job.interface";
import { Queue } from "../queue/queue.interface";

export class Job<T = unknown, R = unknown> implements JobInterface<T, R> {
  constructor(
    private readonly queue: Queue<T, R>,
    public readonly data: JobData<T>,
    public readonly state: JobState
  ) {}

  async process(): Promise<void> {
    this.state.status = "active";
    this.state.processedAt = Date.now();
    await this.queue.saveJob(this);
  }

  async complete(): Promise<void> {
    this.state.status = "completed";
    this.state.completedAt = Date.now();
    await this.queue.saveJob(this);
  }

  async fail(reason: string): Promise<void> {
    this.state.status = "failed";
    this.state.failedReason = reason;
    await this.queue.saveJob(this);
  }

  async moveToDelay(ms: number): Promise<void> {
    this.state.status = "delayed";
    this.state.delay = ms;
    await this.queue.saveJob(this);
  }

  async updateProgress(progress: number): Promise<void> {
    this.state.progress = progress;
    await this.queue.saveJob(this);
  }

  get id(): string {
    return this.data.id;
  }
}
