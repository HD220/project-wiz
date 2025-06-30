import { randomUUID } from 'node:crypto'; // Added import

import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';


// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleJobRepository } from '../../../../infrastructure/persistence/drizzle/job/drizzle-job.repository';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { TestDb, createTestDbClient, runMigrations } from '../../../../infrastructure/queue/drizzle/__tests__/test-db.helper';
import { QueueService } from '../../../../infrastructure/queue/drizzle/queue.service';
import { JobEntity, JobStatus } from '../../../domain/job/job.entity';
import { JobIdVO } from '../../../domain/job/value-objects/job-id.vo';
import { IJobOptions } from '../../../domain/job/value-objects/job-options.vo';
import { WorkerService, WorkerOptions } from '../worker.service';

type TestPayload = { data: string; id?: string };
type TestResult = { status: string; id?: string };

const QUEUE_NAME = 'test-worker-queue';

describe('WorkerService (Integration with In-Memory DB)', () => {
  let db: TestDb;
  let jobRepository: DrizzleJobRepository;
  let queueService: QueueService<TestPayload, TestResult>;
  let workerService: WorkerService<TestPayload, TestResult>;
  let mockProcessor: Mock<[JobEntity<TestPayload, TestResult>], Promise<TestResult>>;

  const defaultWorkerOptions: WorkerOptions = {
    concurrency: 1, // Concurrency is effectively 1 due to sequential processing
    lockDuration: 10000, // 10s
    lockRenewTimeBuffer: 2000, // Renew 2s before lock expires
    pollingIntervalMs: 250, // Faster polling for tests
  };

  const defaultJobOptions: IJobOptions = {
    attempts: 1,
    priority: 0,
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    db = createTestDbClient({ memory: true });
    await runMigrations(db);
    jobRepository = new DrizzleJobRepository(db);
    queueService = new QueueService<TestPayload, TestResult>(QUEUE_NAME, jobRepository, defaultJobOptions);
    vi.spyOn(queueService, 'emit'); // Spy on queue events if needed

    mockProcessor = vi.fn();
    workerService = new WorkerService(queueService, mockProcessor, defaultWorkerOptions);
    vi.spyOn(workerService, 'emit'); // Spy on worker events
  });

  afterEach(async () => {
    try {
      const closePromise = workerService.close();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('workerService.close() timed out in afterEach')), 7000)
      );
      await Promise.race([closePromise, timeoutPromise]);
    } catch (errorDetails) {
      console.error(`Error during workerService.close() in afterEach:`, errorDetails);
    } finally {
      await queueService.close(); // Close queue service as well
      vi.clearAllMocks();
      vi.restoreAllMocks();
      vi.useRealTimers();
      if (db && typeof (db as any).close === 'function') { // Type assertion for safety
        (db as any).close();
      }
    }
  });

  const addJobToQueue = async (name: string, payload: TestPayload, opts?: Partial<IJobOptions>): Promise<JobEntity<TestPayload, TestResult>> => {
    // Ensure jobId is part of options if provided in payload, or generate one if not.
    // This helps in retrieving the job by a known ID later if needed.
    const jobOptionsWithId = { ...defaultJobOptions, ...opts };
    if (payload.id && !jobOptionsWithId.jobId) {
      jobOptionsWithId.jobId = payload.id;
    }
    return queueService.add(name, payload, jobOptionsWithId);
  };


  it('should create a worker instance', () => {
    expect(workerService).toBeInstanceOf(WorkerService);
    expect(workerService.isClosed).toBe(false);
    expect(workerService.isRunning).toBe(false);
  });

  describe('run and job processing', () => {
    it('should fetch and process a job successfully from the actual queue', async () => {
      const jobPayload = { data: 'process me', id: randomUUID() }; // Use randomUUID
      const jobName = 'success-job';
      const addedJob = await addJobToQueue(jobName, jobPayload);
      const expectedResult = { status: 'processed', id: jobPayload.id }; // Use the same UUID

      mockProcessor.mockResolvedValueOnce(expectedResult);

      workerService.run();
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50); // Allow polling and processing

      expect(mockProcessor).toHaveBeenCalledTimes(1);
      const processedJobEntity = mockProcessor.mock.calls[0][0];
      expect(processedJobEntity.id.value).toBe(addedJob.id.value);
      expect(processedJobEntity.payload).toEqual(jobPayload);

      const jobFromDb = await jobRepository.findById(addedJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
      expect(jobFromDb!.returnValue).toEqual(expectedResult);

      expect(workerService.emit).toHaveBeenCalledWith('worker.job.active', expect.objectContaining({ id: addedJob.id }));
      expect(workerService.emit).toHaveBeenCalledWith('worker.job.processed', expect.objectContaining({ id: addedJob.id }), expectedResult);
      expect(workerService.isRunning).toBe(true);
    });

    it('should handle job processing failure and mark job as failed in DB', async () => {
      const jobPayload = { data: 'fail me', id: randomUUID() }; // Use randomUUID
      const jobName = 'fail-job';
      const addedJob = await addJobToQueue(jobName, jobPayload, { attempts: 1 }); // Only 1 attempt
      const error = new Error('Processing failed');

      mockProcessor.mockRejectedValueOnce(error);

      workerService.run();
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);

      expect(mockProcessor).toHaveBeenCalledTimes(1);
      const jobFromDb = await jobRepository.findById(addedJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.FAILED);
      expect(jobFromDb!.failedReason).toBe(error.message);

      expect(workerService.emit).toHaveBeenCalledWith('worker.job.active', expect.objectContaining({ id: addedJob.id }));
      expect(workerService.emit).toHaveBeenCalledWith('worker.job.errored', expect.objectContaining({ id: addedJob.id }), error);
    });


    it('should process jobs sequentially (concurrency 1)', async () => {
      const job1Payload = { data: 'seq_data1', id: randomUUID() }; // Use randomUUID
      const job2Payload = { data: 'seq_data2', id: randomUUID() }; // Use randomUUID
      const addedJob1 = await addJobToQueue('seq-job1', job1Payload);
      const addedJob2 = await addJobToQueue('seq-job2', job2Payload);

      let job1ProcessorEndsAt: number | null = null;
      let job2ProcessorStartsAt: number | null = null;

      mockProcessor.mockImplementation(async (job) => {
        const realTimeNow = vi.getRealSystemTime ? vi.getRealSystemTime() : Date.now(); // Vitest v1 has getRealSystemTime
        if (job.payload.id === job2Payload.id) { // Compare with payload's UUID
          job2ProcessorStartsAt = realTimeNow;
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
        if (job.payload.id === job1Payload.id) { // Compare with payload's UUID
          job1ProcessorEndsAt = vi.getRealSystemTime ? vi.getRealSystemTime() : Date.now();
        }
        return { status: `done_${job.payload.id}`, id: job.payload.id };
      });

      workerService.run();

      // Advance time for job1 to be fetched and processed
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 100 + 50); // poll + process + buffer
      const job1FromDb = await jobRepository.findById(addedJob1.id);
      expect(job1FromDb!.status).toBe(JobStatus.COMPLETED);
      expect(job1ProcessorEndsAt).not.toBeNull();

      // Advance time for job2 to be fetched and processed
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 100 + 50); // poll + process + buffer
      const job2FromDb = await jobRepository.findById(addedJob2.id);
      expect(job2FromDb!.status).toBe(JobStatus.COMPLETED);
      expect(job2ProcessorStartsAt).not.toBeNull();

      expect(job2ProcessorStartsAt!).toBeGreaterThanOrEqual(job1ProcessorEndsAt!);

      // Poll for the empty queue
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
      // mockProcessor should have been called twice only
      expect(mockProcessor).toHaveBeenCalledTimes(2);
    });

    it('should handle job.updateProgress and job.addLog from processor, saved to DB', async () => {
      const jobPayload = { data: 'progress data', id: randomUUID() }; // Use randomUUID
      const addedJob = await addJobToQueue('progress-log-job', jobPayload);

      mockProcessor.mockImplementationOnce(async (jobCtx) => {
        await jobCtx.updateProgress(50); // Make sure this doesn't error due to potential state mismatch if jobCtx is not perfectly in sync
        await jobCtx.addLog('Processor log 1', 'INFO');
        return { status: 'progress_done', id: jobCtx.payload.id };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);

      expect(mockProcessor).toHaveBeenCalledTimes(1);
      const jobFromDb = await jobRepository.findById(addedJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.progress).toBe(50);
      expect(jobFromDb!.logs.length).toBe(1);
      expect(jobFromDb!.logs[0].message).toBe('Processor log 1');
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
    });
  });

  describe('lock renewal', () => {
    it('should renew lock periodically for an active job', async () => {
      const jobPayload = { data: 'renew me', id: randomUUID() }; // Use randomUUID
      const addedJob = await addJobToQueue('lockrenew-job', jobPayload);

      let jobProcessorPromiseResolve: (value: TestResult) => void;
      const jobProcessingPromise = new Promise<TestResult>(resolve => {
        jobProcessorPromiseResolve = resolve;
      });
      mockProcessor.mockImplementationOnce(() => jobProcessingPromise);

      workerService.run();
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50); // Job picked up

      const jobAfterPickup = await jobRepository.findById(addedJob.id);
      expect(jobAfterPickup!.status).toBe(JobStatus.ACTIVE);
      const initialLockUntil = jobAfterPickup!.lockUntil;

      // Advance time to just before the first lock renewal should happen
      // lockDuration = 10000, lockRenewTimeBuffer = 2000. So, renew at 8000ms from lock acquisition.
      // Polling is 250ms. Job processing starts quickly.
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.lockDuration! - defaultWorkerOptions.lockRenewTimeBuffer! - defaultWorkerOptions.pollingIntervalMs! - 100); // e.g., 7650ms

      const jobBeforeFirstRenewalAttempt = await jobRepository.findById(addedJob.id);
      expect(jobBeforeFirstRenewalAttempt!.lockUntil!.getTime()).toEqual(initialLockUntil!.getTime());

      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 200); // e.g., total ~8100ms, past renewal point
      const jobAfterFirstRenewal = await jobRepository.findById(addedJob.id);
      expect(jobAfterFirstRenewal!.lockUntil!.getTime()).toBeGreaterThan(initialLockUntil!.getTime());
      const firstRenewalLockUntil = jobAfterFirstRenewal!.lockUntil;

      // Advance time for another renewal cycle
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.lockDuration! - defaultWorkerOptions.lockRenewTimeBuffer! + 100);
      const jobAfterSecondRenewal = await jobRepository.findById(addedJob.id);
      expect(jobAfterSecondRenewal!.lockUntil!.getTime()).toBeGreaterThan(firstRenewalLockUntil!.getTime());

      // Resolve the processor to allow the job to complete
      jobProcessorPromiseResolve!({ status: 'renewed_done', id: addedJob.payload.id });
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50); // Allow completion

      const jobAfterCompletion = await jobRepository.findById(addedJob.id);
      expect(jobAfterCompletion!.status).toBe(JobStatus.COMPLETED);
    });

    it('should stop renewing lock if job finishes', async () => {
      const jobPayload = { data: 'stop renew', id: randomUUID() }; // Use randomUUID
      const addedJob = await addJobToQueue('lockstop-job', jobPayload);

      mockProcessor.mockResolvedValueOnce({ status: 'stopped_done', id: jobPayload.id });

      workerService.run();
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50); // Job picked up and processed quickly

      const jobFromDb = await jobRepository.findById(addedJob.id);
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
      const lockUntilAtCompletion = jobFromDb!.lockUntil;

      // Advance time past where a renewal would have happened
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.lockDuration!);
      const jobLater = await jobRepository.findById(jobFromDb!.id);
      // LockUntil should not have changed from when it was completed (or became null)
      if (lockUntilAtCompletion) {
         expect(jobLater!.lockUntil!.getTime()).toEqual(lockUntilAtCompletion.getTime());
      } else {
         expect(jobLater!.lockUntil).toBeNull();
      }
    });
  });

  describe('close', () => {
    it('should stop polling, wait for active jobs, and shutdown gracefully', async () => {
      const jobPayload = { data: 'closing job 1', id: randomUUID() }; // Use randomUUID
      const addedJob = await addJobToQueue('close-graceful-job', jobPayload);

      let jobPromiseResolve: (value: TestResult) => void;
      const jobProcessingPromise = new Promise<TestResult>(resolve => { jobPromiseResolve = resolve; });
      mockProcessor.mockImplementationOnce(() => jobProcessingPromise);

      workerService.run();
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50); // job picked up
      expect((await jobRepository.findById(addedJob.id))!.status).toBe(JobStatus.ACTIVE);

      const closePromise = workerService.close();
      expect(workerService.isRunning).toBe(false);

      // Try to advance timers, no new jobs should be fetched
      const fetchSpy = vi.spyOn(queueService, 'fetchNextJobAndLock');
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! * 3);
      expect(fetchSpy).not.toHaveBeenCalled(); // Should not fetch after close initiated
      fetchSpy.mockRestore();

      // Job still "processing"
      expect((await jobRepository.findById(addedJob.id))!.status).toBe(JobStatus.ACTIVE);

      // Resolve job
      jobPromiseResolve!({ status: `closed_${addedJob.payload.id}`, id: addedJob.payload.id });
      await vi.advanceTimersByTimeAsync(10); // Allow microtasks for job completion

      await closePromise; // Wait for close to fully complete

      expect((await jobRepository.findById(addedJob.id))!.status).toBe(JobStatus.COMPLETED);
      expect(workerService.isClosed).toBe(true);
    });

    it('should close immediately if no active jobs', async () => {
      workerService.run(); // No jobs in queue
      // Allow one poll cycle to complete to ensure pollLoopPromise is set and resolved if no job
      await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);

      const closePromise = workerService.close();
      // Advance timers to allow close() internal waits (e.g. for pollLoopPromise)
      await vi.advanceTimersByTimeAsync(100); // Small advance for promise resolutions
      await closePromise;

      expect(workerService.isClosed).toBe(true);
      expect(mockProcessor).not.toHaveBeenCalled();
    }, 7000); // Increased timeout for this test
  });

  it('should emit worker.error if queue.fetchNextJobAndLock throws and continues polling', async () => {
    const fetchError = new Error('DB connection lost during fetch');
    const fetchNextJobAndLockSpy = vi.spyOn(queueService, 'fetchNextJobAndLock');
    fetchNextJobAndLockSpy.mockRejectedValueOnce(fetchError); // First call fails

    workerService.run();
    // First poll attempt, encounters error
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50);
    expect(workerService.emit).toHaveBeenCalledWith('worker.error', fetchError);

    // Worker waits for pollingIntervalMs * 2 after error, then polls again
    fetchNextJobAndLockSpy.mockResolvedValueOnce(null); // Next attempt finds no job
    // Advance for error backoff + next poll cycle
    await vi.advanceTimersByTimeAsync((defaultWorkerOptions.pollingIntervalMs! * 2) + defaultWorkerOptions.pollingIntervalMs! + 50);

    expect(fetchNextJobAndLockSpy).toHaveBeenCalledTimes(2);
    fetchNextJobAndLockSpy.mockRestore();
  });

  it('should emit worker.job.interrupted if closed during processing and not call complete/fail on queue', async () => {
    const jobPayload = { data: 'interrupt me', id: randomUUID() }; // Use randomUUID
    const addedJob = await addJobToQueue('interrupt-job', jobPayload);

    const processorPromiseCtrl = { resolve: () => {}, reject: () => {} };
    const processorPromise = new Promise<TestResult>((resolve, reject) => {
      processorPromiseCtrl.resolve = resolve;
      processorPromiseCtrl.reject = reject;
    });

    mockProcessor.mockImplementationOnce(() => processorPromise);

    workerService.run();
    await vi.advanceTimersByTimeAsync(defaultWorkerOptions.pollingIntervalMs! + 50); // Job picked up

    expect(workerService.emit).toHaveBeenCalledWith('worker.job.active', expect.objectContaining({ id: addedJob.id }));
    expect(mockProcessor).toHaveBeenCalledTimes(1);

    const closePromise = workerService.close(); // Initiate close

    // Simulate processor finishing *after* close was called
    processorPromiseCtrl.resolve({ status: 'finished_but_worker_closed', id: addedJob.payload.id });

    await vi.runAllTimersAsync(); // Allow all timers (polling, lock renewal, close loop) to run
    await closePromise;

    expect(workerService.isClosed).toBe(true);
    expect(workerService.emit).toHaveBeenCalledWith('worker.job.interrupted', expect.objectContaining({ id: addedJob.id }));

    const jobFromDb = await jobRepository.findById(addedJob.id);
    expect(jobFromDb!.status).toBe(JobStatus.ACTIVE); // Should remain active, not completed or failed by worker
    expect(jobFromDb!.failedReason).toBeNull();
    expect(jobFromDb!.returnValue).toBeNull();
  });
});
