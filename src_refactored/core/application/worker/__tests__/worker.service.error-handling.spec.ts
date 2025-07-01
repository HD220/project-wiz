import { randomUUID } from 'node:crypto';

import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleJobRepository } from '../../../../infrastructure/persistence/drizzle/job/drizzle-job.repository';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { TestDb, createTestDbClient, runMigrations } from '../../../../infrastructure/queue/drizzle/__tests__/test-db.helper';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleQueueFacade as QueueService } from '../../../../infrastructure/queue/drizzle/drizzle-queue.facade';
import { JobEntity, JobStatus } from '../../../domain/job/job.entity';
import { IJobOptions } from '../../../domain/job/value-objects/job-options.vo';
import { WorkerService } from '../worker.service';

import {
  TestPayload, TestResult, QUEUE_NAME,
  defaultWorkerOptions, defaultJobOptions
} from './worker.service.spec.helper';

describe('WorkerService - Error Handling and Edge Cases', () => {
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
    vi.spyOn(workerService, 'emit');
    vi.spyOn(queueService, 'fetchNextJobAndLock');
  });

  afterEach(async () => {
    if (!workerService.isClosed) await workerService.close();
    if (queueService) await queueService.close();
    vi.clearAllMocks(); vi.restoreAllMocks(); vi.useRealTimers();
    if (db && typeof db.close === 'function') db.close();
  });

  it('should emit worker.error if queue.fetchNextJobAndLock throws', async () => {
    const fetchError = new Error('DB connection lost');
    (queueService.fetchNextJobAndLock as Mock).mockRejectedValueOnce(fetchError);
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    expect(workerService.emit).toHaveBeenCalledWith('worker.error', fetchError);
  });

  it('should emit worker.job.interrupted if closed during processing', async () => {
    const jobPayload = { data: 'interrupt me', id: randomUUID() };
    const addedJob = await addJobToQueue('interrupt-job', jobPayload);
    const processorPromise = new Promise<TestResult>(() => {});
    mockProcessor.mockImplementationOnce(() => processorPromise);
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    await workerService.close();
    expect(workerService.emit).toHaveBeenCalledWith('worker.job.interrupted', expect.objectContaining({ id: addedJob.id }));
    const jobFromDb = await jobRepository.findById(addedJob.id);
    expect(jobFromDb!.status).toBe(JobStatus.ACTIVE);
  });
});
