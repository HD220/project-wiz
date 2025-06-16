import { Job } from "../job";
import { JobStatus } from "../job/index";
import { Result, ok, error } from "@/core/common/result";

interface JobDrizzleRepository {
  create(job: Omit<Job, "id">): Promise<Job>;
  getById(id: string): Promise<Job | null>;
  getNextPending(agentId: string): Promise<Job | null>;
  update(id: string, updates: Partial<Job>): Promise<void>;
  getByStatus(status: JobStatus): Promise<Job[]>;
  getByDependency(jobId: string): Promise<Job[]>;
  getMany(ids: string[]): Promise<Job[]>;
}

export interface Queue {
  getNextJob(agentId: string): Promise<Job | null>;
  jobFinished(jobId: string, result: unknown): Promise<void>;
  jobDelayed(jobId: string): Promise<void>;
  jobFailed(jobId: string, error: string): Promise<void>;
}

export class QueueImpl implements Queue {
  private repository: JobDrizzleRepository;

  constructor(repository: JobDrizzleRepository) {
    this.repository = repository;
  }

  async addJob(
    job: Omit<Job, "id" | "status" | "attempts">
  ): Promise<Result<Job>> {
    const newJob: Omit<Job, "id"> = {
      ...job,
      status:
        job.dependsOn && job.dependsOn.length > 0
          ? JobStatus.WAITING
          : JobStatus.PENDING,
      attempts: 0,
    };

    try {
      const createdJob = await this.repository.create(newJob);
      return ok(createdJob);
    } catch (err) {
      return error(err instanceof Error ? err.message : "Failed to add job");
    }
  }

  async getNextJob(agentId: string): Promise<Job | null> {
    const job = await this.repository.getNextPending(agentId);
    if (!job) return null;

    await this.repository.update(job.id.toString(), {
      status: JobStatus.RUNNING,
      attempts: job.attempts + 1,
    });

    return job;
  }

  async jobFinished(jobId: string, result: unknown): Promise<void> {
    await this.repository.update(jobId, {
      status: JobStatus.COMPLETED,
      result,
    });
    await this.checkDependentJobs(jobId);
  }

  async jobDelayed(jobId: string): Promise<void> {
    const job = await this.repository.getById(jobId);
    if (!job) return;

    await this.repository.update(jobId, {
      status: JobStatus.WAITING,
      ...(job.retryDelay && { delay: this.calculateRetryDelay(job) }),
    });
  }

  async jobFailed(jobId: string, error: string): Promise<void> {
    const job = await this.repository.getById(jobId);
    if (!job) return;

    if (job.attempts >= job.maxAttempts) {
      await this.repository.update(jobId, {
        status: JobStatus.FAILED,
        result: error,
      });
    } else {
      await this.jobDelayed(jobId);
    }
  }

  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return this.repository.getByStatus(status);
  }

  private async checkDependentJobs(jobId: string): Promise<void> {
    const dependentJobs = await this.repository.getByDependency(jobId);

    for (const job of dependentJobs) {
      const allDepsFinished = await this.areAllDependenciesFinished(job);
      if (allDepsFinished) {
        const dependenciesData = await this.getDependenciesData(
          job.dependsOn || []
        );
        await this.repository.update(job.id.toString(), {
          status: JobStatus.PENDING,
          payload: {
            ...(job.payload as object),
            dependencies: dependenciesData,
          },
        });
      }
    }
  }

  private async areAllDependenciesFinished(job: Job): Promise<boolean> {
    if (!job.dependsOn || job.dependsOn.length === 0) return true;
    const dependencies = await this.repository.getMany(job.dependsOn);
    return dependencies.every((dep) => dep.status === JobStatus.COMPLETED);
  }

  private async getDependenciesData(
    jobIds: string[]
  ): Promise<Record<string, unknown>> {
    const jobs = await this.repository.getMany(jobIds);
    return jobs.reduce(
      (acc, job) => ({
        ...acc,
        [job.id.toString()]: job.result,
      }),
      {}
    );
  }

  private calculateRetryDelay(job: Job): number {
    return (job.attempts + 1) ** 2 * (job.retryDelay || 1000);
  }
}

export function validateStatusTransition(
  current: JobStatus,
  next: JobStatus
): boolean {
  const validTransitions: Record<JobStatus, JobStatus[]> = {
    [JobStatus.PENDING]: [JobStatus.RUNNING, JobStatus.WAITING],
    [JobStatus.RUNNING]: [
      JobStatus.COMPLETED,
      JobStatus.WAITING,
      JobStatus.FAILED,
    ],
    [JobStatus.COMPLETED]: [],
    [JobStatus.WAITING]: [JobStatus.PENDING],
    [JobStatus.FAILED]: [JobStatus.WAITING],
  };

  return validTransitions[current].includes(next);
}
