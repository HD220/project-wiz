import { Database } from "better-sqlite3";
import { Queue } from "./queue.interface";
import { Job } from "../job/job";
import { JobData } from "../job/job.interface";
import { SqliteJobRepository } from "../sqlite/sqlite-job.repository";

export class SqliteQueue<T = unknown> implements Queue<T> {
  private readonly jobRepository: SqliteJobRepository<T>;

  constructor(private readonly db: Database) {
    this.jobRepository = new SqliteJobRepository(db);
  }

  async add(
    data: T,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    }
  ): Promise<Job<T>> {
    const jobData: JobData<T> = {
      id: this.generateId(),
      payload: data,
      attempts: 0,
      maxAttempts: options?.attempts || 3,
      createdAt: Date.now(),
      priority: options?.priority || 0,
    };

    const job = new Job(this.jobRepository, jobData, {
      status: options?.delay ? "delayed" : "waiting",
      delay: options?.delay,
      processedAt: undefined,
      completedAt: undefined,
      failedReason: undefined,
      progress: 0,
    });

    await this.jobRepository.save(job);
    return job;
  }

  async getJob(id: string): Promise<Job<T> | null> {
    return this.jobRepository.getById(id);
  }

  async getJobs(status?: string): Promise<Job<T>[]> {
    if (status) {
      return this.jobRepository.getJobsByStatus(status as any);
    }
    return this.jobRepository.getJobsByStatus("waiting");
  }

  async clear(): Promise<void> {
    await this.jobRepository.clear();
  }

  async getNextJob(): Promise<Job<T> | null> {
    return this.jobRepository.getNextJob();
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
