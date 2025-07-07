// src/infrastructure/queue/drizzle/queue-service-core.ts
import EventEmitter from "node:events";

import { IJobRepository } from "@/core/application/ports/job-repository.interface";
// AbstractQueue import removed
import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";
// JobOptionsVO class needed for JobOptionsVO.create
import {
  IJobOptions,
  JobOptionsVO,
} from "@/core/domain/job/value-objects/job-options.vo";

// IQueueMaintenanceService forward declaration no longer needed here

export class QueueServiceCore<
  P extends { userId?: string },
  R,
> extends EventEmitter {
  public readonly queueName: string;
  protected readonly jobRepository: IJobRepository<P, R>;
  protected readonly defaultJobOptions: JobOptionsVO;

  constructor(
    queueName: string,
    jobRepository: IJobRepository<P, R>,
    defaultJobOptions?: IJobOptions
  ) {
    // Call EventEmitter constructor
    super();
    this.queueName = queueName;
    this.jobRepository = jobRepository;
    this.defaultJobOptions = JobOptionsVO.create(defaultJobOptions);
  }

  // setMaintenanceService method removed

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
    // Specific cleanup for QueueServiceCore, if any, would go here.
    // For example, ensuring any in-memory state is cleared or persisted if necessary.
    // Stopping maintenance is now handled by the Facade.
    this.emit("queue.closed");
    // Add any other core cleanup logic here
  }

  // Placeholder methods for AbstractQueue are removed as this class no longer extends it directly.
}
