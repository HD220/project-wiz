// src/infrastructure/queue/drizzle/drizzle-queue.facade.ts
import { IJobRepository } from "@/core/application/ports/job-repository.interface";
import { AbstractQueue } from "@/core/application/queue/abstract-queue";
import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";
import { IJobOptions } from "@/core/domain/job/value-objects/job-options.vo";

import { JobProcessingService } from "./job-processing.service";
import { QueueMaintenanceService } from "./queue-maintenance.service";
import { QueueServiceCore } from "./queue-service-core";

export class DrizzleQueueFacade<
  P extends { userId?: string },
  R,
> extends AbstractQueue<P, R> {
  constructor(
    // Parameters for AbstractQueue constructor
    queueName: string,
    // jobRepository is also used by core, processor, maintenance
    jobRepository: IJobRepository<P, R>,
    // Composed services
    private readonly coreService: QueueServiceCore<P, R>,
    private readonly processingService: JobProcessingService<P, R>,
    private readonly maintenanceService: QueueMaintenanceService<P, R>,
    defaultJobOptions?: IJobOptions
  ) {
    super(queueName, jobRepository, defaultJobOptions);
    // Ensure composed services also have the emitter from AbstractQueue (this.emit)
    // This might require passing `this` (the facade, which is an EventEmitter) to them,
    // or having them take a separate emitter that the facade also uses.
    // For now, assuming the services received their emitters upon their own construction.
  }

  async add(
    jobName: string,
    data: P,
    opts?: IJobOptions
  ): Promise<JobEntity<P, R>> {
    return this.coreService.add(jobName, data, opts);
  }

  async addBulk(
    jobs: Array<{ name: string; data: P; opts?: IJobOptions }>
  ): Promise<Array<JobEntity<P, R>>> {
    return this.coreService.addBulk(jobs);
  }

  async getJob(jobId: string | JobIdVO): Promise<JobEntity<P, R> | null> {
    return this.coreService.getJob(jobId);
  }

  async getJobsByStatus(
    statuses: JobStatus[],
    start?: number,
    end?: number,
    asc?: boolean
  ): Promise<Array<JobEntity<P, R>>> {
    return this.coreService.getJobsByStatus(statuses, start, end, asc);
  }

  async countJobsByStatus(
    statuses?: JobStatus[]
  ): Promise<Partial<Record<JobStatus, number>>> {
    return this.coreService.countJobsByStatus(statuses);
  }

  async pause(): Promise<void> {
    return this.coreService.pause();
  }

  async resume(): Promise<void> {
    return this.coreService.resume();
  }

  async clean(
    gracePeriodMs: number,
    limit: number,
    status?: JobStatus
  ): Promise<number> {
    return this.coreService.clean(gracePeriodMs, limit, status);
  }

  async fetchNextJobAndLock(
    workerId: string,
    lockDurationMs: number
  ): Promise<JobEntity<P, R> | null> {
    return this.processingService.fetchNextJobAndLock(workerId, lockDurationMs);
  }

  async extendJobLock(
    jobId: string | JobIdVO,
    workerId: string,
    lockDurationMs: number
  ): Promise<void> {
    return this.processingService.extendJobLock(
      jobId,
      workerId,
      lockDurationMs
    );
  }

  async markJobAsCompleted(
    jobId: string | JobIdVO,
    workerId: string,
    result: R,
    jobInstanceWithChanges: JobEntity<P, R>
  ): Promise<void> {
    return this.processingService.markJobAsCompleted(
      jobId,
      workerId,
      result,
      jobInstanceWithChanges
    );
  }

  async markJobAsFailed(
    jobId: string | JobIdVO,
    workerId: string,
    error: Error,
    jobInstanceWithChanges: JobEntity<P, R>
  ): Promise<void> {
    return this.processingService.markJobAsFailed(
      jobId,
      workerId,
      error,
      jobInstanceWithChanges
    );
  }

  async updateJobProgress(
    jobId: string | JobIdVO,
    workerId: string,
    progress: number | object
  ): Promise<void> {
    return this.processingService.updateJobProgress(jobId, workerId, progress);
  }

  async addJobLog(
    jobId: string | JobIdVO,
    workerId: string,
    message: string,
    level?: string
  ): Promise<void> {
    return this.processingService.addJobLog(jobId, workerId, message, level);
  }

  startMaintenance(): void {
    this.maintenanceService.startMaintenance();
  }

  async stopMaintenance(): Promise<void> {
    return this.maintenanceService.stopMaintenance();
  }

  public async close(): Promise<void> {
    await this.maintenanceService.stopMaintenance();
    // coreService.close() will emit its own 'queue.closed'
    await this.coreService.close();
    // The facade could emit an overall "facade.closed" or rely on core's event.
    // For AbstractQueue compatibility, super.close() might be expected if AbstractQueue had a close.
    // AbstractQueue currently does not have a close method in its definition, but QueueServiceCore does.
    // Let's ensure this facade's close aligns with AbstractQueue's intent if it were to have one.
    // Since AbstractQueue extends EventEmitter, its own 'close' is not a defined method.
    // So, emitting 'queue.closed' from the facade itself after sub-services are closed is reasonable.
    // Emit from the facade itself
    this.emit("queue.closed");
  }
}
