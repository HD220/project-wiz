import { IJobOptions } from '../../../domain/job/value-objects/job-options.vo';
import { WorkerOptions } from '../worker.service';

export type TestPayload = { data: string; id?: string };
export type TestResult = { status: string; id?: string };

export const QUEUE_NAME = 'test-worker-queue';

export const defaultWorkerOptions: WorkerOptions = {
  concurrency: 1,
  lockDuration: 10000,
  lockRenewTimeBuffer: 2000,
  pollingIntervalMs: 250,
};

export const defaultJobOptions: IJobOptions = {
  attempts: 1,
  priority: 0,
};
