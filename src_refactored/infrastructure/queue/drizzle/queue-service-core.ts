// src_refactored/infrastructure/queue/drizzle/queue-service-core.ts
import { IJobRepository } from "@/core/application/ports/job-repository.interface";
import { AbstractQueue } from "@/core/application/queue/abstract-queue";
import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";
import { IJobOptions } from "@/core/domain/job/value-objects/job-options.vo"; // JobOptionsVO removed

// Forward declaration for IQueueMaintenanceService to break circular dependency if needed for close()
interface IQueueMaintenanceService {
  stopMaintenance(): Promise<void>;
}

export class QueueServiceCore<P, R> extends AbstractQueue<P, R> {
  // Maintenance service can be optional or injected if close needs to call it
  private maintenanceService?: IQueueMaintenanceService;

  constructor(
    queueName: string,
    jobRepository: IJobRepository,
    defaultJobOptions?: IJobOptions,
    maintenanceService?: IQueueMaintenanceService
  ) {
    super(queueName, jobRepository, defaultJobOptions);
    this.maintenanceService = maintenanceService;
  }

  public setMaintenanceService(service: IQueueMaintenanceService): void {
    this.maintenanceService = service;
  }

  async add(
    jobName: string,
    data: P,
    opts?: IJobOptions
  ): Promise<JobEntity<P, R>> {
    const job = JobEntity.create<P, R>({
      queueName: this.queueName,
      name: jobName,
      payload: data,
      options: { ...this.defaultJobOptions.toPersistence(), ...opts },
    });
    await this.jobRepository.save(job);
    this.emit("job.added", job);
    return job;
  }

  async addBulk(
    jobs: Array<{ name: string; data: P; opts?: IJobOptions }>
  ): Promise<Array<JobEntity<P, R>>> {
    const jobEntities = jobs.map((jobDef) =>
      JobEntity.create<P, R>({
        queueName: this.queueName,
        name: jobDef.name,
        payload: jobDef.data,
        options: { ...this.defaultJobOptions.toPersistence(), ...jobDef.opts },
      })
    );
    for (const job of jobEntities) {
      await this.jobRepository.save(job);
      this.emit("job.added", job);
    }
    return jobEntities;
  }

  async getJob(jobId: string | JobIdVO): Promise<JobEntity<P, R> | null> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    return (await this.jobRepository.findById(id)) as JobEntity<P, R> | null;
  }

  async getJobsByStatus(
    statuses: JobStatus[],
    start?: number,
    end?: number,
    asc?: boolean
  ): Promise<Array<JobEntity<P, R>>> {
    return (await this.jobRepository.getJobsByStatus(
      this.queueName,
      statuses,
      start,
      end,
      asc
    )) as Array<JobEntity<P, R>>;
  }

  async countJobsByStatus(
    statuses?: JobStatus[]
  ): Promise<Partial<Record<JobStatus, number>>> {
    return await this.jobRepository.countJobsByStatus(this.queueName, statuses);
  }

  async pause(): Promise<void> {
    this.emit("queue.paused");
    // Actual pause logic might involve signaling workers or preventing job fetching
  }

  async resume(): Promise<void> {
    this.emit("queue.resumed");
    // Actual resume logic
  }

  async clean(
    gracePeriodMs: number,
    limit: number,
    status?: JobStatus
  ): Promise<number> {
    return await this.jobRepository.clean(
      this.queueName,
      gracePeriodMs,
      limit,
      status
    );
  }

  public async close(): Promise<void> {
    if (this.maintenanceService) {
      await this.maintenanceService.stopMaintenance();
    }
    this.emit("queue.closed");
    // Add any other core cleanup logic here (e.g., database connections if managed directly)
  }

  // Methods from AbstractQueue that will be implemented by other services
  // These will need to be handled, possibly by changing AbstractQueue or by composition.
  // For now, to make QueueServiceCore a valid extension of AbstractQueue (if it were complete),
  // these would need to be abstract or throw errors.
  // However, the goal is that QueueServiceCore *won't* be the sole implementer of AbstractQueue.

  // These parameters will be flagged as unused by ESLint. This is acceptable for these stubs.
  async fetchNextJobAndLock(workerId: string, lockDurationMs: number): Promise<JobEntity<P, R> | null> {
    throw new Error("Method not implemented in QueueServiceCore. See JobProcessingService.");
  }
  async extendJobLock(jobId: string | JobIdVO, workerId: string, lockDurationMs: number): Promise<void> {
    throw new Error("Method not implemented in QueueServiceCore. See JobProcessingService.");
  }
  async markJobAsCompleted(jobId: string | JobIdVO, workerId: string, result: R, jobInstanceWithChanges: JobEntity<P,R>): Promise<void> {
    throw new Error("Method not implemented in QueueServiceCore. See JobProcessingService.");
  }
  async markJobAsFailed(jobId: string | JobIdVO, workerId: string, error: Error, jobInstanceWithChanges: JobEntity<P,R>): Promise<void> {
    throw new Error("Method not implemented in QueueServiceCore. See JobProcessingService.");
  }
  async updateJobProgress(jobId: string | JobIdVO, workerId: string, progress: number | object): Promise<void> {
    throw new Error("Method not implemented in QueueServiceCore. See JobProcessingService.");
  }
  async addJobLog(jobId: string | JobIdVO, workerId: string, message: string, level?: string): Promise<void> {
    throw new Error("Method not implemented in QueueServiceCore. See JobProcessingService.");
  }
  startMaintenance(): void {
    throw new Error("Method not implemented in QueueServiceCore. See QueueMaintenanceService.");
  }
  async stopMaintenance(): Promise<void> {
    throw new Error("Method not implemented in QueueServiceCore. See QueueMaintenanceService.");
  }
}
