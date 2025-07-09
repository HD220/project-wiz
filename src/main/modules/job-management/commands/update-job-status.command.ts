import { JobRepository } from '../job.repository';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { JobStatus } from '../job.types'; // Import JobStatus from the new location

export interface UpdateJobStatusCommandPayload {
  jobId: string;
  status: JobStatus;
  error?: string; // Optional error message for Failed status
  returnValue?: any; // Optional return value for Completed status
}

export class UpdateJobStatusCommand {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(payload: UpdateJobStatusCommandPayload): Promise<void> {
    const jobId = new JobIdVO(payload.jobId);
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new Error(`Job with ID ${payload.jobId} not found`);
    }

    switch (payload.status) {
      case JobStatus.Running:
        // This command might not be the right place to move to 'Running'
        // as it typically involves a worker picking up the job.
        // However, if there's a manual override or specific scenario, it could be used.
        // For now, we'll assume the job is already in a state that can be moved to Running if needed.
        // Or, this case could be removed if status updates are more granular
        // (e.g., separate commands for markAsFailed, markAsCompleted).
        job.moveToActive(job.workerId || 'unknown_worker', new Date(Date.now() + 10 * 60 * 1000)); // Example lock duration
        break;
      case JobStatus.Completed:
        if (payload.returnValue === undefined) {
          throw new Error('Return value must be provided for Completed status');
        }
        job.markAsCompleted(payload.returnValue);
        break;
      case JobStatus.Failed:
        if (!payload.error) {
          throw new Error('Error message must be provided for Failed status');
        }
        job.markAsFailed(payload.error);
        break;
      case JobStatus.Queued:
        // This might be for requeueing a job
        job.moveToWaiting(); // Or a more specific method if available
        break;
      default:
        throw new Error(`Unsupported status: ${payload.status}`);
    }

    await this.jobRepository.update(job);
  }
}
