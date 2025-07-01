import { randomUUID } from 'node:crypto';

import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleJobRepository } from '../../../../infrastructure/persistence/drizzle/job/drizzle-job.repository';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { TestDb, createTestDbClient, runMigrations } from '../../../../infrastructure/queue/drizzle/__tests__/test-db.helper';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleQueueFacade as QueueService } from '../../../../infrastructure/queue/drizzle/drizzle-queue.facade';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { QueueServiceCore } from '../../../../infrastructure/queue/drizzle/queue-service-core';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { JobProcessingService } from '../../../../infrastructure/queue/drizzle/job-processing.service';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { QueueMaintenanceService } from '../../../../infrastructure/queue/drizzle/queue-maintenance.service';
import { JobEntity } from '../../../domain/job/job.entity';
import { IJobOptions } from '../../../domain/job/value-objects/job-options.vo';
import { WorkerService } from '../worker.service';

import {
  TestPayload, TestResult, QUEUE_NAME,
  defaultWorkerOptions, defaultJobOptions
} from './worker.service.spec.helper';

describe('WorkerService - Lock Renewal', () => {
  let db: TestDb;
  let jobRepository: DrizzleJobRepository;
  let queueService: QueueService<TestPayload, TestResult>;
  let workerService: WorkerService<TestPayload, TestResult>;
  let mockProcessor: Mock<[JobEntity<TestPayload, TestResult>], Promise<TestResult>>;

  const addJobToQueue = async (name: string, payload: TestPayload, opts?: Partial<IJobOptions>) => {
    const jobOptionsWithId = { ...defaultJobOptions, ...opts };
    if (payload.id && !jobOptionsWithId.jobId) jobOptionsWithId.jobId = payload.id;
    return queueService.add(name, payload, jobOptionsWithId);
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    db = createTestDbClient({ memory: true });
    await runMigrations(db);
    jobRepository = new DrizzleJobRepository(db);
    queueService = new QueueService<TestPayload, TestResult>(QUEUE_NAME, jobRepository, defaultJobOptions);
    mockProcessor = vi.fn();
    workerService = new WorkerService(queueService, mockProcessor, defaultWorkerOptions);
  });

  afterEach(async () => {
    if (!workerService.isClosed) await workerService.close();
    if (queueService) await queueService.close();
    vi.clearAllMocks(); vi.restoreAllMocks(); vi.useRealTimers();
    if (db && typeof db.close === 'function') db.close();
  });

  it('should renew lock periodically for an active job', async () => {
    const jobPayload = { data: 'renew me', id: randomUUID() };
    const addedJob = await addJobToQueue('lockrenew-job', jobPayload);
    let jobProcessorPromiseResolve: (value: TestResult) => void;
    const jobProcessingPromise = new Promise<TestResult>(resolve => { jobProcessorPromiseResolve = resolve; });
    mockProcessor.mockImplementationOnce(() => jobProcessingPromise);
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    const initialLockUntil = (await jobRepository.findById(addedJob.id))!.lockUntil;
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.lockDuration! - defaultWorkerOptions.lockRenewTimeBuffer! + 100);
    expect((await jobRepository.findById(addedJob.id))!.lockUntil!.getTime()).toBeGreaterThan(initialLockUntil!.getTime());
    jobProcessorPromiseResolve!({ status: 'renewed_done', id: addedJob.payload.id });
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
  });

  it('should stop renewing lock if job finishes', async () => {
    const jobPayload = { data: 'stop renew', id: randomUUID() };
    const addedJob = await addJobToQueue('lockstop-job', jobPayload);
    mockProcessor.mockResolvedValueOnce({ status: 'stopped_done', id: jobPayload.id });
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    const lockUntilAtCompletion = (await jobRepository.findById(addedJob.id))!.lockUntil;
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.lockDuration!);
    const jobLater = await jobRepository.findById(addedJob.id);
    if (lockUntilAtCompletion) expect(jobLater!.lockUntil!.getTime()).toEqual(lockUntilAtCompletion.getTime());
    else expect(jobLater!.lockUntil).toBeNull();
  });
});
