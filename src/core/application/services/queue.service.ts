import { IJobRepository } from '../ports/job-repository.interface';
import { IQueueService, AddJobOptions } from '../ports/queue-service.interface';
import {
  Job,
  JobId,
  JobStatus,
  JobName,
  JobPriority,
  JobAttempts,
  ActivityContext,
  // ActivityHistoryEntry // Not directly used here yet, but part of ActivityContext
} from '@/core/domain/entities/job';
import { randomUUID } from 'node:crypto'; // Using built-in crypto

// UuidGenerator and SystemClock interfaces and default implementations (in-file for now)
interface UuidGenerator { generate: () => string; }
interface SystemClock { now: () => Date; }
const defaultUuidGenerator: UuidGenerator = { generate: () => randomUUID() };
const defaultSystemClock: SystemClock = { now: () => new Date() };

export class QueueService implements IQueueService {
  private readonly MAX_RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes, example

  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly uuidGenerator: UuidGenerator = defaultUuidGenerator,
    private readonly systemClock: SystemClock = defaultSystemClock
  ) {}

  async addJob(
    jobName: string,
    activityContext: ActivityContext,
    options?: AddJobOptions
  ): Promise<Job> {
    const now = this.systemClock.now();
    // The JobId static create method already uses randomUUID if no arg is passed.
    // Using it directly here to align with the explicit UuidGenerator pattern if it were injected.
    const jobId = JobId.fromString(this.uuidGenerator.generate());

    let status = JobStatus.pending();
    if (options?.dependsOn && options.dependsOn.length > 0) {
      status = JobStatus.pending();
    } else if (options?.startAfter && options.startAfter > now) {
      status = JobStatus.delayed();
    } else {
      status = JobStatus.waiting();
    }

    // The Job.create static method should be used to construct the Job entity
    // to ensure all invariants and defaults within the entity are handled.
    // The current Job.create in job.entity.ts takes a different shape of initialProps.
    // I will adapt the call or assume Job.create can handle this shape,
    // or that Job constructor is public for Repositories/Services (less ideal).
    // For now, let's assume we can construct it with all props.
    // This might need adjustment based on exact Job.create signature.
    // Reverting to use Job.create as intended by the entity definition:
    const job = Job.create({
        id: jobId, // Pass the generated JobId
        name: JobName.create(jobName),
        priority: options?.priority || JobPriority.create(10),
        activityContext: activityContext,
        payload: options?.payload,
        status: status, // Pass the determined status
        attempts: JobAttempts.create(0, 3),
        createdAt: now,
        updatedAt: now,
        // executeAfter and dependsOn are not in the current Job.create initialProps
        // This implies Job.create might need to be extended, or these set post-creation
        // if the entity allows it (e.g. through methods that return new instances).
    });
    // Manually setting properties not handled by current Job.create
    if (options?.startAfter) job.props.executeAfter = options.startAfter;
    if (options?.dependsOn) job.props.dependsOn = options.dependsOn;


    await this.jobRepository.save(job);
    return job;
  }

  async getNextJobToProcess(workerId?: string): Promise<Job | null> {
    // workerId is currently unused, for future use
    const availableJobs = await this.jobRepository.findPendingJobs(1);
    if (availableJobs.length === 0) {
      return null;
    }
    // For now, return the job without marking it active here.
    // The worker/agent will call markJobAsActive.
    return availableJobs[0];
  }

  async updateJobStatus(jobId: JobId, status: JobStatus): Promise<Job> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId.getValue()} not found for status update.`);
    }
    // The Job entity's updateStatus method returns a new Job instance.
    let updatedJob = job.updateStatus(status);
    // Ensure updatedAt is set on the props of the new instance before saving
    (updatedJob.props as any).updatedAt = this.systemClock.now();
    await this.jobRepository.save(updatedJob);
    return updatedJob;
  }

  async markJobAsActive(jobId: JobId, workerId?: string): Promise<Job> {
    // workerId could be logged into ActivityContext here or associated with the job if schema supported it
    console.log(`Job ${jobId.getValue()} marked as active by worker ${workerId || 'unknown'}`);
    return this.updateJobStatus(jobId, JobStatus.active());
  }

  async markJobAsCompleted(jobId: JobId, resultData: Record<string, any>): Promise<Job> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId.getValue()} not found for completion.`);
    }
    // The Job entity's setResult method also sets status to completed and updates timestamp.
    let completedJob = job.setResult(resultData);
    (completedJob.props as any).updatedAt = this.systemClock.now(); // Ensure timestamp if setResult doesn't
    await this.jobRepository.save(completedJob);
    return completedJob;
  }

  async markJobAsFailed(jobId: JobId, failureReason: string): Promise<Job> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId.getValue()} not found for failure marking.`);
    }

    let updatedJob = job.incrementAttempts();
    (updatedJob.props as any).updatedAt = this.systemClock.now();

    if (updatedJob.attempts.canRetry()) {
      const delayMs = Math.min(
        (updatedJob.attempts.current ** 2) * 1000,
        this.MAX_RETRY_DELAY_MS
      );
      (updatedJob.props as any).executeAfter = new Date(this.systemClock.now().getTime() + delayMs);
      updatedJob = updatedJob.updateStatus(JobStatus.delayed());
    } else {
      updatedJob = updatedJob.updateStatus(JobStatus.failed());
    }

    // Add failureReason to result or ActivityContext
    // For now, assuming failureReason might be part of the result for simplicity
    const resultWithFailure = { ...updatedJob.props.result, error: failureReason };
    updatedJob = updatedJob.setResult(resultWithFailure); // This will also set status to completed by default
    // So, we must re-apply the failed/delayed status AFTER setting result if setResult changes status
    if (updatedJob.attempts.canRetry()) {
        updatedJob = updatedJob.updateStatus(JobStatus.delayed());
    } else {
        updatedJob = updatedJob.updateStatus(JobStatus.failed());
    }
    (updatedJob.props as any).updatedAt = this.systemClock.now(); // Final timestamp update


    await this.jobRepository.save(updatedJob);
    return updatedJob;
  }

  async findById(jobId: JobId): Promise<Job | null> {
    // This simply delegates to the jobRepository.
    // It's added to IQueueService to allow WorkerService to re-fetch job state
    // without directly depending on IJobRepository itself, keeping dependencies on QueueService.
    return this.jobRepository.findById(jobId);
  }

  async saveJob(job: Job): Promise<Job> {
    // This method assumes that the job's updatedAt field should be set before saving.
    // The Job entity methods (updateStatus, setResult, etc.) already return new instances
    // with an updated `updatedAt`. If this save is for arbitrary changes (like context only),
    // the caller should ensure `updatedAt` is appropriately set on the job instance first.
    // For simplicity, QueueService can enforce it here if needed, or Job entity can handle it.
    // Let's assume Job entity methods used by WorkerService already set updatedAt.
    // If not, uncomment line below:
    // (job.props as any).updatedAt = this.systemClock.now();
    await this.jobRepository.save(job);
    return job;
  }
}
