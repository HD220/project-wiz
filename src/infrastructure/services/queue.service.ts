import { Job } from "@/core/domain/entities/job/job.entity";
import { JobId } from "@/core/domain/entities/job/value-objects/job-id.vo";
import { JobQueue } from "@/core/application/ports/job-queue.interface";
import { JobRepository } from "@/core/application/ports/job-repository.interface";
import { Result, ok, error } from "@/shared/result";
import { ProcessJobService } from "@/core/application/ports/process-job-service.interface";
import { Worker } from "@/core/domain/entities/worker/worker.entity";
import { JobStatus } from "@/core/domain/entities/job/value-objects/job-status.vo";
import { JobDependsOn } from "@/core/domain/entities/job/value-objects/job-depends-on.vo";

type EventCallback = (job: Job, attempt?: number) => void;
type EventType = "completed" | "failed" | "retrying" | "new_job";

export class QueueService implements JobQueue {
  private eventListeners: Record<EventType, EventCallback[]> = {
    completed: [],
    failed: [],
    retrying: [],
    new_job: [],
  };

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly processJobService: ProcessJobService,
    private readonly worker: Worker
  ) {}

  async addJob(job: Job): Promise<void> {
    let jobToPersist = job;

    if (job.dependsOn.hasDependencies()) {
      const dependencies = job.dependsOn.value;
      const dependencyJobsResult =
        await this.jobRepository.findByIds(dependencies);

      if (dependencyJobsResult.isError()) {
        throw new Error(
          `Failed to retrieve dependencies for job: ${dependencyJobsResult.message}`
        );
      }

      const allDependenciesFinished = dependencyJobsResult.value.every(
        (depJob) => depJob.status.value === "FINISHED"
      );

      if (!allDependenciesFinished) {
        jobToPersist = job.toWaiting();
      }
    }

    const result = await this.jobRepository.create(jobToPersist);
    if (result.isError()) {
      throw new Error(`Failed to add job: ${result.message}`);
    }
    this.emit("new_job", result.value);
  }

  async processJobs(): Promise<void> {
    const jobsResult = await this.jobRepository.list();
    if (jobsResult.isError()) {
      throw new Error(`Failed to list jobs: ${jobsResult.message}`);
    }

    for (const job of jobsResult.value) {
      if (job.status.value === "WAITING" || job.status.value === "DELAYED") {
        await this.processJob(job);
      }
    }
  }

  on(event: EventType, callback: EventCallback): void {
    this.eventListeners[event].push(callback);
  }

  private async processJob(job: Job): Promise<Result<Job>> {
    const processResult = await this.processJobService.process(
      job,
      this.worker
    );

    if (processResult.isError()) {
      if (job.retryPolicy && job.attempts < job.retryPolicy.value.maxAttempts) {
        this.emit("retrying", job, job.attempts + 1);
        const delayedJob = job.delay();
        await this.jobRepository.update(delayedJob);
        return ok(delayedJob);
      }

      this.emit("failed", job);
      const failedJob = job.fail();
      await this.jobRepository.update(failedJob);
      return error(processResult.message);
    }

    this.emit("completed", job);
    const completedJob = job.complete();
    await this.jobRepository.update(completedJob);

    // Lógica para Jobs dependentes
    await this._processDependentJobs(completedJob);

    return ok(completedJob);
  }

  private emit(event: EventType, job: Job, attempt?: number): void {
    for (const callback of this.eventListeners[event]) {
      callback(job, attempt);
    }
  }
  private async _processDependentJobs(completedJob: Job): Promise<void> {
    const dependentJobsResult = await this.jobRepository.findDependentJobs(
      completedJob.id
    );

    if (dependentJobsResult.isError()) {
      console.error(
        `Failed to find dependent jobs: ${dependentJobsResult.message}`
      );
      return;
    }

    for (const dependentJob of dependentJobsResult.value) {
      if (dependentJob.status.value === "WAITING") {
        const dependencies = dependentJob.dependsOn.value;
        const dependencyJobsResult =
          await this.jobRepository.findByIds(dependencies);

        if (dependencyJobsResult.isError()) {
          console.error(
            `Failed to retrieve dependencies for dependent job ${dependentJob.id.value}: ${dependencyJobsResult.message}`
          );
          continue;
        }

        const allDependenciesFinished = dependencyJobsResult.value.every(
          (depJob) => depJob.status.value === "FINISHED"
        );

        if (allDependenciesFinished) {
          const results: Record<string, unknown> =
            dependencyJobsResult.value.reduce(
              (acc: Record<string, unknown>, depJob) => {
                acc[depJob.id.value] = depJob.result;
                return acc;
              },
              {}
            );

          const updatedPayload = {
            ...dependentJob.payload,
            dependsOnResults: results,
          };

          const jobToUpdate = dependentJob.toPending(updatedPayload);
          await this.jobRepository.update(jobToUpdate);
        }
      }
    }
  }
}
