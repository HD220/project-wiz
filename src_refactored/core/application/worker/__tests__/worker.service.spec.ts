import { WorkerService, WorkerOptions, ProcessorFunction } from '../worker.service';
import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { vi, describe, it, expect, beforeEach, Mock, afterEach } from 'vitest';
import EventEmitter from 'events';

// Mock AbstractQueue
class MockQueue<P, R> extends EventEmitter implements AbstractQueue<P, R> {
  queueName: string;
  jobRepository: any; // Not used directly by WorkerService, can be minimal
  defaultJobOptions: any;

  constructor(name: string) {
    super();
    this.queueName = name;
  }

  add = vi.fn() as Mock<any[], Promise<JobEntity<P, R>>>;
  addBulk = vi.fn() as Mock<any[], Promise<Array<JobEntity<P, R>>>>;
  getJob = vi.fn() as Mock<[string | JobIdVO], Promise<JobEntity<P, R> | null>>;
  getJobsByStatus = vi.fn() as Mock<any[], Promise<Array<JobEntity<P, R>>>>;
  countJobsByStatus = vi.fn() as Mock<any[], Promise<Partial<Record<JobStatus, number>>>>;
  pause = vi.fn() as Mock<[], Promise<void>>;
  resume = vi.fn() as Mock<[], Promise<void>>;
  clean = vi.fn() as Mock<any[], Promise<number>>;
  close = vi.fn() as Mock<[], Promise<void>>;

  fetchNextJobAndLock = vi.fn() as Mock<[string, number], Promise<JobEntity<P, R> | null>>;
  extendJobLock = vi.fn() as Mock<[string | JobIdVO, string, number], Promise<void>>;
  markJobAsCompleted = vi.fn() as Mock<[string | JobIdVO, string, R, JobEntity<P,R>], Promise<void>>;
  markJobAsFailed = vi.fn() as Mock<[string | JobIdVO, string, Error, JobEntity<P,R>], Promise<void>>;
  updateJobProgress = vi.fn() as Mock<[string | JobIdVO, string, number | object], Promise<void>>;
  addJobLog = vi.fn() as Mock<[string | JobIdVO, string, string, string?], Promise<void>>;
  startMaintenance = vi.fn() as Mock<[], void>;
}

type TestPayload = { data: string };
type TestResult = { status: string };

describe('WorkerService', () => {
  let workerService: WorkerService<TestPayload, TestResult>;
  let mockQueue: MockQueue<TestPayload, TestResult>;
  let mockProcessor: Mock<[JobEntity<TestPayload, TestResult>], Promise<TestResult>>;

  const workerOptions: WorkerOptions = {
    concurrency: 1,
    lockDuration: 10000, // 10s
    lockRenewTimeBuffer: 2000, // Renew 2s before lock expires
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockQueue = new MockQueue('test-queue');
    mockProcessor = vi.fn();
    workerService = new WorkerService(mockQueue, mockProcessor, workerOptions);
    vi.spyOn(workerService, 'emit');
  });

  afterEach(async () => {
    await workerService.close(); // Ensure worker is closed and timers are cleared
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

import { randomUUID } from 'node:crypto';

// ... (other imports)

  const createMockJob = (idSuffix: string, payload: TestPayload, status = JobStatus.WAITING): JobEntity<TestPayload, TestResult> => {
    // Use a passed suffix for easier debugging if needed, but generate a valid UUID for the ID itself.
    // Or, just use randomUUID directly if the suffix isn't strictly for ID.
    // For this case, let's make the ID a valid UUID. The suffix can be for logging/tracking in tests.
    const job = JobEntity.create<TestPayload, TestResult>({
      id: JobIdVO.create(randomUUID()), // Generate valid UUID
      queueName: mockQueue.queueName,
      name: `test-job-${idSuffix}`, // Keep suffix in name for easier test identification
      payload,
    });
    job.status = status; // manually set for testing different scenarios
    if (status === JobStatus.ACTIVE) {
        job.moveToActive(`worker-${idSuffix}`, new Date(Date.now() + workerOptions.lockDuration));
    }
    return job;
  };

  it('should create a worker instance', () => {
    expect(workerService).toBeInstanceOf(WorkerService);
    expect(workerService.isClosed).toBe(false);
    expect(workerService.isRunning).toBe(false);
  });

  describe('run and job processing', () => {
    it('should fetch and process a job successfully', async () => {
      const job = createMockJob('success', { data: 'process me' });
      const expectedResult = { status: 'processed' };

      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockResolvedValueOnce(expectedResult);

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // Allow polling and processing

      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledWith(workerService.workerId, workerOptions.lockDuration);
      expect(mockProcessor).toHaveBeenCalledWith(job);
      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job.id, workerService.workerId, expectedResult, job);
      expect(workerService.emit).toHaveBeenCalledWith('worker.job.active', job);
      expect(workerService.emit).toHaveBeenCalledWith('worker.job.processed', job, expectedResult);
      expect(workerService.isRunning).toBe(true);
    });

    it('should handle job processing failure', async () => {
      const job = createMockJob('fail', { data: 'fail me' });
      const error = new Error('Processing failed');

      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockRejectedValueOnce(error);

      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      expect(mockProcessor).toHaveBeenCalledWith(job);
      expect(mockQueue.markJobAsFailed).toHaveBeenCalledWith(job.id, workerService.workerId, error, job);
      expect(workerService.emit).toHaveBeenCalledWith('worker.job.active', job);
      expect(workerService.emit).toHaveBeenCalledWith('worker.job.errored', job, error);
    });

    it('should not fetch new jobs if concurrency limit is reached', async () => {
      const job1 = createMockJob('c1', { data: 'c_data1' });
      // Simulate job1 is being processed and takes time
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job1);
      mockProcessor.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({status: 'done_c1'}), 5000)));

      workerService.run(); // Starts processing job1
      await vi.advanceTimersByTimeAsync(100); // job1 picked up

      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(1);
      expect(workerService.activeJobCount).toBe(1);

      // Try to advance time, but since concurrency is 1, no new job should be fetched yet
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(1); // Still 1, as job1 is active

      await vi.advanceTimersByTimeAsync(5000); // job1 finishes
      await vi.advanceTimersByTimeAsync(100); // Polling for next

      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job1.id, workerService.workerId, {status: 'done_c1'}, job1);
      expect(workerService.activeJobCount).toBe(0);
      // Now it should poll again
      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(2);
    });

    it('should respect concurrency > 1', async () => {
      workerService.close(); // close default worker
      const multiConcurrencyOptions = { ...workerOptions, concurrency: 2 };
      workerService = new WorkerService(mockQueue, mockProcessor, multiConcurrencyOptions);
      vi.spyOn(workerService, 'emit');


      const job1 = createMockJob('mc1', { data: 'mc_data1' });
      const job2 = createMockJob('mc2', { data: 'mc_data2' });

      mockQueue.fetchNextJobAndLock
        .mockResolvedValueOnce(job1)
        .mockResolvedValueOnce(job2)
        .mockResolvedValue(null); // No more jobs after these two

      mockProcessor.mockImplementation(async (job) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        return { status: `done_${job.id.value}` };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // Poll and pick up job1 & job2

      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(2); // Fetched two jobs due to concurrency
      expect(workerService.activeJobCount).toBe(2);
      expect(mockProcessor).toHaveBeenCalledWith(job1);
      expect(mockProcessor).toHaveBeenCalledWith(job2);

      await vi.advanceTimersByTimeAsync(1500); // Allow jobs to finish

      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job1.id, workerService.workerId, {status: `done_${job1.id.value}`}, job1);
      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job2.id, workerService.workerId, {status: `done_${job2.id.value}`}, job2);
      expect(workerService.activeJobCount).toBe(0);
    });


    it('should handle job.updateProgress and job.addLog from processor', async () => {
      const job = createMockJob('progress', { data: 'progress data' });
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);

      mockProcessor.mockImplementationOnce(async (j) => {
        j.updateProgress(50); // This should call queue.updateJobProgress via the bound method
        j.addLog('Processor log 1', 'INFO'); // This should call queue.addJobLog
        return { status: 'progress_done' };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      expect(mockProcessor).toHaveBeenCalledWith(job);
      // The actual call to queue methods happens because JobEntity methods are bound by WorkerService
      // before passing the job to the processor.
      expect(mockQueue.updateJobProgress).toHaveBeenCalledWith(job.id, workerService.workerId, 50);
      expect(mockQueue.addJobLog).toHaveBeenCalledWith(job.id, workerService.workerId, 'Processor log 1', 'INFO');
      expect(mockQueue.markJobAsCompleted).toHaveBeenCalled();
    });
  });

  describe('lock renewal', () => {
    it('should renew lock periodically for an active job', async () => {
      const job = createMockJob('lockrenew', { data: 'renew me' });
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);

      // Simulate a long-running job
      mockProcessor.mockImplementationOnce(async () => {
        await vi.advanceTimersByTimeAsync(workerOptions.lockDuration * 2); // Process longer than lock duration
        return { status: 'renewed_done' };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // Job picked up

      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(1);
      expect(workerService.activeJobCount).toBe(1);

      // Advance time to just before the first lock renewal should happen
      // lockDuration = 10000, lockRenewTimeBuffer = 2000. So, renew at 8000ms.
      await vi.advanceTimersByTimeAsync(workerOptions.lockDuration - workerOptions.lockRenewTimeBuffer - 100); // e.g., 7900ms
      expect(mockQueue.extendJobLock).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(200); // e.g., total 8100ms, past renewal point
      expect(mockQueue.extendJobLock).toHaveBeenCalledWith(job.id, workerService.workerId, workerOptions.lockDuration);

      // Advance time for another renewal cycle
      await vi.advanceTimersByTimeAsync(workerOptions.lockDuration - workerOptions.lockRenewTimeBuffer + 100);
      expect(mockQueue.extendJobLock).toHaveBeenCalledTimes(2);

      // Allow job to finish
      await vi.runOnlyPendingTimersAsync();
      await vi.runOnlyPendingTimersAsync(); // one more for safety for all promises to resolve

      expect(mockQueue.markJobAsCompleted).toHaveBeenCalled();
      expect(workerService.activeJobCount).toBe(0);
    });

    it('should stop renewing lock if job finishes', async () => {
      const job = createMockJob('lockstop', { data: 'stop renew' });
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);

      // Job finishes quickly, before first lock renewal
      mockProcessor.mockResolvedValueOnce({ status: 'stopped_done' });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // Job picked up and processed

      expect(mockQueue.markJobAsCompleted).toHaveBeenCalled();

      // Advance time past where a renewal would have happened
      await vi.advanceTimersByTimeAsync(workerOptions.lockDuration);
      expect(mockQueue.extendJobLock).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should stop polling for new jobs and wait for active jobs to complete (graceful shutdown)', async () => {
      const job1 = createMockJob('close1', { data: 'closing job 1' });
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job1);

      // job1 takes 2 seconds to process
      mockProcessor.mockImplementationOnce(async (j) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { status: `closed_${j.id.value}` };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // job1 is picked up

      expect(workerService.activeJobCount).toBe(1);
      expect(workerService.isRunning).toBe(true);

      const closePromise = workerService.close(); // Initiate close
      expect(workerService.isClosing).toBe(true);
      expect(workerService.isRunning).toBe(false); // Should stop polling loop immediately

      // At this point, fetchNextJobAndLock should not be called again even if polling interval hits
      mockQueue.fetchNextJobAndLock.mockClear(); // Clear previous calls
      await vi.advanceTimersByTimeAsync(500); // Advance, but no new jobs should be fetched
      expect(mockQueue.fetchNextJobAndLock).not.toHaveBeenCalled();

      expect(workerService.activeJobCount).toBe(1); // job1 still processing

      await vi.advanceTimersByTimeAsync(2000); // Allow job1 to complete
      await closePromise; // Wait for close to fully complete

      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job1.id, workerService.workerId, {status: `closed_${job1.id.value}`}, job1);
      expect(workerService.activeJobCount).toBe(0);
      expect(workerService.isClosed).toBe(true);
      // Check that internal timers (polling, lock renewal) are cleared
      // This is hard to check directly without exposing internals, but graceful shutdown implies this.
    });

    it('should close immediately if no active jobs', async () => {
      mockQueue.fetchNextJobAndLock.mockResolvedValue(null); // No jobs
      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      const closePromise = workerService.close();
      await closePromise;

      expect(workerService.isClosed).toBe(true);
      expect(workerService.activeJobCount).toBe(0);
      // No jobs were processed
      expect(mockProcessor).not.toHaveBeenCalled();
    });

    it('multiple close calls should not cause issues', async () => {
      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      const p1 = workerService.close();
      const p2 = workerService.close(); // Call close again while already closing

      await Promise.all([p1, p2]);
      expect(workerService.isClosed).toBe(true);
    });
  });

  // TODO: Test for 'worker.error' event if the queue itself throws an error during operations.
  // This might require making the mockQueue.fetchNextJobAndLock throw an error.
});
