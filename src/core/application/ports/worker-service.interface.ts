import { JobId } from '@/core/domain/entities/job';

export interface IWorkerService {
  processJobById(jobId: JobId): Promise<void>;
  startProcessingLoop(intervalMs?: number): Promise<void>; // To periodically check for jobs
}
