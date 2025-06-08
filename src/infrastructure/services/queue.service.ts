import { Job } from "../../core/domain/entities/job/job.entity";
import { JobId } from "../../core/domain/entities/job/value-objects/job-id.vo";
import { JobQueue } from "../../core/application/ports/job-queue.interface";
import { JobRepository } from "../../core/application/ports/job-repository.interface";
import { Result, ok, error } from "../../shared/result";
import { ProcessJobService } from "../../core/application/ports/process-job-service.interface";
import { Worker } from "../../core/domain/entities/worker/worker.entity";

type EventCallback = (jobId: JobId, attempt?: number) => void;
type EventType = "completed" | "failed" | "retrying";

export class QueueService implements JobQueue {
  private eventListeners: Record<EventType, EventCallback[]> = {
    completed: [],
    failed: [],
    retrying: [],
  };

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly processJobService: ProcessJobService,
    private readonly worker: Worker
  ) {}

  async addJob(job: Job): Promise<void> {
    const result = await this.jobRepository.create(job);
    if (result.isError()) {
      throw new Error(`Failed to add job: ${result.message}`);
    }
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
        this.emit("retrying", job.id, job.attempts + 1);
        const delayedJob = job.delay();
        await this.jobRepository.update(delayedJob);
        return ok(delayedJob);
      }

      this.emit("failed", job.id);
      const failedJob = job.fail();
      await this.jobRepository.update(failedJob);
      return error(processResult.message);
    }

    this.emit("completed", job.id);
    const completedJob = job.complete();
    await this.jobRepository.update(completedJob);
    return ok(completedJob);
  }

  private emit(event: EventType, jobId: JobId, attempt?: number): void {
    for (const callback of this.eventListeners[event]) {
      callback(jobId, attempt);
    }
  }
}
