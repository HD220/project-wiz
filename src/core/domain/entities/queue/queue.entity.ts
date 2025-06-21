import { Job } from "../jobs/job.entity";
import { Result } from "../../../../shared/result";

export class Queue {
  private id: string;
  private name: string;
  private jobs: Job[] = [];
  private createdAt: Date;
  private updatedAt: Date;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public addJob(job: Job): Result<boolean> {
    // Valida a prioridade do job antes de adicionar
    if (job.getPriority() < 1 || job.getPriority() > 10) {
      return {
        success: false,
        error: {
          name: "InvalidPriority",
          message: "Job priority must be between 1 and 10",
        },
      };
    }

    this.jobs.push(job);
    this.updatedAt = new Date();
    return { success: true, data: true };
  }

  public getNextJob(): Result<Job | null> {
    // Filtra jobs disponíveis e ordena por prioridade (maior primeiro)
    const availableJobs = this.jobs
      .filter(
        (job) => job.getStatus().is("waiting") || job.getStatus().is("delayed")
      )
      .sort((a, b) => b.getPriority() - a.getPriority());

    const nextJob = availableJobs[0] || null;
    return { success: true, data: nextJob };
  }

  public markJobAsStarted(jobId: string): Result<boolean> {
    const job = this.jobs.find((j) => j.getId() === jobId);
    if (!job) {
      return {
        success: false,
        error: {
          name: "JobNotFound",
          message: `Job with id ${jobId} not found in queue`,
        },
      };
    }

    const result = job.start();
    if (result.success) {
      this.updatedAt = new Date();
    }
    return result;
  }

  public markJobAsCompleted(jobId: string): Result<boolean> {
    const job = this.jobs.find((j) => j.getId() === jobId);
    if (!job) {
      return {
        success: false,
        error: {
          name: "JobNotFound",
          message: `Job with id ${jobId} not found in queue`,
        },
      };
    }

    const result = job.complete();
    if (result.success) {
      this.updatedAt = new Date();
    }
    return result;
  }

  public markJobAsFailed(jobId: string): Result<boolean> {
    const job = this.jobs.find((j) => j.getId() === jobId);
    if (!job) {
      return {
        success: false,
        error: {
          name: "JobNotFound",
          message: `Job with id ${jobId} not found in queue`,
        },
      };
    }

    const result = job.fail();
    if (result.success) {
      this.updatedAt = new Date();
    }
    return result;
  }

  public markJobAsDelayed(jobId: string): Result<boolean> {
    const job = this.jobs.find((j) => j.getId() === jobId);
    if (!job) {
      return {
        success: false,
        error: {
          name: "JobNotFound",
          message: `Job with id ${jobId} not found in queue`,
        },
      };
    }

    const result = job.delay();
    if (result.success) {
      this.updatedAt = new Date();
    }
    return result;
  }
}
