// src/core/domain/entities/queue/queue.entity.ts

import { Job, JobProps } from '../jobs/job.entity'; // Assuming Job is in the same level
import { JobStatusType } from '../jobs/job-status';

export interface QueueProps {
  id: string;
  name: string;
  concurrency: number;
  createdAt: Date;
  updatedAt: Date;
  // Store job IDs for relations, actual Job objects can be fetched by repository
  jobIds?: string[];
}

export class Queue {
  private props: QueueProps;
  private jobs: Job<any, any>[] = []; // In-memory list of jobs for current operations, not for full persistence state

  constructor(props: Omit<QueueProps, 'createdAt' | 'updatedAt' | 'jobIds'> & { createdAt?: Date, updatedAt?: Date, jobIds?: string[] }) {
    const now = new Date();
    this.props = {
      ...props,
      jobIds: props.jobIds || [],
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get name(): string { return this.props.name; }
  public get concurrency(): number { return this.props.concurrency; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }
  public get jobIds(): string[] { return this.props.jobIds || []; }

  // Methods
  public addJob(job: Job<any, any>): void {
    if (!this.props.jobIds) {
      this.props.jobIds = [];
    }
    if (!this.props.jobIds.includes(job.id)) {
      this.props.jobIds.push(job.id);
      // Optionally, add to in-memory list if needed for immediate operations,
      // but repository should be source of truth for getNextJob based on persisted state
      // this.jobs.push(job);
      this.props.updatedAt = new Date();
    }
  }

  public removeJob(jobId: string): void {
    if (this.props.jobIds) {
      this.props.jobIds = this.props.jobIds.filter(id => id !== jobId);
    }
    // this.jobs = this.jobs.filter(j => j.id !== jobId);
    this.props.updatedAt = new Date();
  }

  // The getNextJob logic here would be a simplified version.
  // The actual robust getNextJob would likely be in a service or repository
  // that can query based on status, priority, and execution time from persistence.
  // This is a placeholder for domain logic if the Queue itself manages a small live set.
  public getNextJobFromMemory(availableJobs: Job<any,any>[]): Job<any, any> | null {
    const now = new Date();
    const processableJobs = availableJobs
      .filter(job =>
        this.jobIds.includes(job.id) &&
        (job.status.is(JobStatusType.WAITING) ||
         (job.status.is(JobStatusType.DELAYED) && (!job.executeAfter || job.executeAfter <= now)))
      )
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority; // Lower number = higher priority
        }
        return a.createdAt.getTime() - b.createdAt.getTime(); // FIFO for same priority
      });

    return processableJobs.length > 0 ? processableJobs[0] : null;
  }

  // Methods to signal job state changes.
  // In a strict DDD sense where Queue is an aggregate root for Jobs, these might modify Job instances.
  // However, docs/arquitetura.md suggests WorkerService/JobRepository handles persistence of Job status changes.
  // These Queue methods could be used for internal logic or simplified if state changes are externalized.

  public markJobAsCompleted(jobId: string, result: any): void {
    // Logic within Queue might involve removing it from an active list or similar.
    // Actual job status update is likely handled by JobRepository.save(job) after job.moveToCompleted().
    console.log(`Queue ${this.name}: Job ${jobId} marked as completed in memory (if applicable).`);
    this.props.updatedAt = new Date();
  }

  public markJobAsFailed(jobId: string, error: Error): void {
    console.log(`Queue ${this.name}: Job ${jobId} marked as failed in memory (if applicable).`);
    this.props.updatedAt = new Date();
  }

  public markJobAsDelayed(jobId: string, delay?: number): void {
    console.log(`Queue ${this.name}: Job ${jobId} marked as delayed in memory (if applicable).`);
    this.props.updatedAt = new Date();
  }

  public static create(
    props: Omit<QueueProps, 'id' | 'createdAt' | 'updatedAt' | 'jobIds'> & { id?: string, jobIds?: string[] }
  ): Queue {
    const const_id = props.id || crypto.randomUUID(); // Assuming browser/node crypto

    const queueProps: Omit<QueueProps, 'createdAt' | 'updatedAt' | 'jobIds'> & { createdAt?: Date, updatedAt?: Date, jobIds?: string[] } = {
      ...props,
      id: const_id,
      jobIds: props.jobIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new Queue(queueProps);
  }
}
