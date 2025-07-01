import { randomUUID } from 'node:crypto';

import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleJobRepository } from '../../../../infrastructure/persistence/drizzle/job/drizzle-job.repository';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { TestDb, createTestDbClient, runMigrations } from '../../../../infrastructure/queue/drizzle/__tests__/test-db.helper';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleQueueFacade as QueueService } from '../../../../infrastructure/queue/drizzle/drizzle-queue.facade';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { JobProcessingService } from '../../../../infrastructure/queue/drizzle/job-processing.service';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { QueueMaintenanceService } from '../../../../infrastructure/queue/drizzle/queue-maintenance.service';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { QueueServiceCore } from '../../../../infrastructure/queue/drizzle/queue-service-core';
import { JobEntity, JobStatus } from '../../../domain/job/job.entity';
import { IJobOptions } from '../../../domain/job/value-objects/job-options.vo';
import { WorkerService } from '../worker.service';

import {
  TestPayload, TestResult, QUEUE_NAME,
  defaultWorkerOptions, defaultJobOptions
} from './worker.service.spec.helper';

describe('WorkerService - Close', () => {
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

    // Instantiate dependencies for DrizzleQueueFacade
    const coreService = new QueueServiceCore<TestPayload, TestResult>(
      QUEUE_NAME,
      jobRepository,
      defaultJobOptions
    );
    // DrizzleQueueFacade (queueService) will be the emitter for its sub-services if they are designed to accept one.
    // However, JobProcessingService and QueueMaintenanceService constructors expect an EventEmitter.
    // QueueServiceCore itself is an EventEmitter. We can use it.
    const processingService = new JobProcessingService<TestPayload, TestResult>(
      jobRepository,
      coreService, // Use coreService as the EventEmitter
      QUEUE_NAME
    );
    const maintenanceService = new QueueMaintenanceService<TestPayload, TestResult>(
      jobRepository,
      coreService, // Use coreService as the EventEmitter
      QUEUE_NAME
    );

    queueService = new QueueService<TestPayload, TestResult>(
      QUEUE_NAME,
      jobRepository,
      defaultJobOptions,
      coreService,
      processingService,
      maintenanceService
    );

    mockProcessor = vi.fn();
    workerService = new WorkerService(queueService, mockProcessor, defaultWorkerOptions);
    vi.spyOn(workerService, 'emit');
  });

  afterEach(async () => {
    if (!workerService.isClosed) await workerService.close();
    if (queueService) await queueService.close();
    vi.clearAllMocks(); vi.restoreAllMocks(); vi.useRealTimers();
    if (db && typeof db.close === 'function') db.close();
  });

  it('should stop polling, wait for active jobs, and shutdown gracefully', async () => {
    const jobPayload = { data: 'closing job 1', id: randomUUID() };
    const addedJob = await addJobToQueue('close-graceful-job', jobPayload);
    let jobPromiseResolve: (value: TestResult) => void;
    const jobProcessingPromise = new Promise<TestResult>(resolve => { jobPromiseResolve = resolve; });
    mockProcessor.mockImplementationOnce(() => jobProcessingPromise);
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    const closePromise = workerService.close();
    jobPromiseResolve!({ status: `closed_${addedJob.payload.id}`, id: addedJob.payload.id });
    await closePromise;
    expect((await jobRepository.findById(addedJob.id))!.status).toBe(JobStatus.COMPLETED);
    expect(workerService.isClosed).toBe(true);
  });

  it('should close immediately if no active jobs', async () => {
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    await workerService.close();
    expect(workerService.isClosed).toBe(true);
  }, 7000);
});
