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
import { JobEntity, JobStatus } from '../../../domain/job/job.entity';
import { IJobOptions } from '../../../domain/job/value-objects/job-options.vo';
import { WorkerService } from '../worker.service';

import {
  TestPayload, TestResult, QUEUE_NAME,
  defaultWorkerOptions, defaultJobOptions
} from './worker.service.spec.helper';

describe('WorkerService - Run and Job Processing', () => {
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
    vi.spyOn(queueService, 'emit');
  });

  afterEach(async () => {
    if (!workerService.isClosed) await workerService.close();
    if (queueService) await queueService.close();
    vi.clearAllMocks(); vi.restoreAllMocks(); vi.useRealTimers();
    if (db && typeof db.close === 'function') db.close();
  });

  it('should fetch and process a job successfully', async () => {
    const jobPayload = { data: 'process me', id: randomUUID() };
    const addedJob = await addJobToQueue('success-job', jobPayload);
    const expectedResult = { status: 'processed', id: jobPayload.id };
    mockProcessor.mockResolvedValueOnce(expectedResult);
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    expect(mockProcessor).toHaveBeenCalledTimes(1);
    const jobFromDb = await jobRepository.findById(addedJob.id);
    expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
    expect(workerService.emit).toHaveBeenCalledWith('worker.job.processed', expect.anything(), expectedResult);
  });

  it('should handle job processing failure', async () => {
    const jobPayload = { data: 'fail me', id: randomUUID() };
    const addedJob = await addJobToQueue('fail-job', jobPayload, { attempts: 1 });
    const error = new Error('Processing failed');
    mockProcessor.mockRejectedValueOnce(error);
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    const jobFromDb = await jobRepository.findById(addedJob.id);
    expect(jobFromDb!.status).toBe(JobStatus.FAILED);
    expect(workerService.emit).toHaveBeenCalledWith('worker.job.errored', expect.anything(), error);
  });

  it('should process jobs sequentially', async () => {
    const job1Payload = { data: 'seq_data1', id: randomUUID() };
    const job2Payload = { data: 'seq_data2', id: randomUUID() };
    await addJobToQueue('seq-job1', job1Payload);
    await addJobToQueue('seq-job2', job2Payload);
    let job1ProcessorEndsAt: number | null = null;
    let job2ProcessorStartsAt: number | null = null;

    mockProcessor.mockImplementation(async (job) => {
      const now = Date.now();
      if (job.payload.id === job2Payload.id) job2ProcessorStartsAt = now;
      await new Promise(resolve => setTimeout(resolve, 100));
      if (job.payload.id === job1Payload.id) job1ProcessorEndsAt = Date.now();
      return { status: `done_${job.payload.id}`, id: job.payload.id };
    });
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 100 + 50);
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 100 + 50);
    expect(job1ProcessorEndsAt).not.toBeNull();
    expect(job2ProcessorStartsAt).not.toBeNull();
    expect(job2ProcessorStartsAt!).toBeGreaterThanOrEqual(job1ProcessorEndsAt!);
    expect(mockProcessor).toHaveBeenCalledTimes(2);
  });

  it('should handle job.updateProgress and job.addLog', async () => {
    const jobPayload = { data: 'progress data', id: randomUUID() };
    const addedJob = await addJobToQueue('progress-log-job', jobPayload);
    mockProcessor.mockImplementationOnce(async (jobCtx) => {
      await jobCtx.updateProgress(50);
      await jobCtx.addLog('Processor log 1', 'INFO');
      return { status: 'progress_done', id: jobCtx.payload.id };
    });
    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    const jobFromDb = await jobRepository.findById(addedJob.id);
    expect(jobFromDb!.progress).toBe(50);
    expect(jobFromDb!.logs[0].message).toBe('Processor log 1');
  });
});
