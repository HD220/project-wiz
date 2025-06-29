import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity'; // Keep JobStatus for potential use if needed by other parts of test setup
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
// IJobOptions and JobOptionsVO are not directly used in this spec, remove to clear unused var warning
// import { IJobOptions, JobOptionsVO } from '@/core/domain/job/value-objects/job-options.vo';

import { WorkerService } from './worker.service';
import { ProcessorFunction, WorkerOptions } from './worker.types';

// Define more specific types for payload and result for these tests
interface TestWorkerPayload { task: string; [key: string]: unknown; }
interface TestWorkerResult { completed?: boolean; done?: boolean; [key: string]: unknown; }


const createTestJobEntityForWorker = (id?: string, payload: TestWorkerPayload = { task: 'work' }) => {
  return JobEntity.create<TestWorkerPayload, TestWorkerResult>({
    id: id ? JobIdVO.create(id) : undefined,
    queueName: 'worker-queue',
    name: 'worker-job',
    payload,
    options: { attempts: 1 },
  });
};

describe('WorkerService', () => {
  let workerService: WorkerService<TestWorkerPayload, TestWorkerResult>;
  let mockQueue: MockProxy<AbstractQueue<TestWorkerPayload, TestWorkerResult>>;
  let mockProcessor: MockProxy<ProcessorFunction<TestWorkerPayload, TestWorkerResult>>;

  const workerOptions: WorkerOptions = {
    concurrency: 1,
    lockDuration: 10000, // 10s
    lockRenewTimeBuffer: 4000, // Renew 4s before expiry (i.e., every 6s)
  };

  beforeEach(() => {
    mockQueue = mock<AbstractQueue<any, any>>();
    mockProcessor = vi.fn(); // Using vi.fn() for basic processor mock
    workerService = new WorkerService(mockQueue, mockProcessor, workerOptions);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    // Ensure worker is closed to stop polling if a test doesn't explicitly close it
    return workerService.close();
  });

  describe('run and job processing', () => {
    it('should fetch and process a job successfully', async () => {
      const job = createTestJobEntityForWorker('job1');
      const expectedResult: TestWorkerResult = { completed: true };
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockResolvedValueOnce(expectedResult);

      const jobProcessedListener = vi.fn();
      workerService.on('worker.job.processed', jobProcessedListener);

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // Allow poll to run

      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledWith(workerService.workerId, workerOptions.lockDuration);
      expect(mockProcessor).toHaveBeenCalledWith(job);
      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job.id, workerService.workerId, expectedResult, job);
      expect(jobProcessedListener).toHaveBeenCalledWith(job, expectedResult);
    });

    it('should handle job processing failure', async () => {
      const job = createTestJobEntityForWorker('job-fail');
      const error = new Error('Processing failed');
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockRejectedValueOnce(error);

      const jobErroredListener = vi.fn();
      workerService.on('worker.job.errored', jobErroredListener);

      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      expect(mockProcessor).toHaveBeenCalledWith(job);
      expect(mockQueue.markJobAsFailed).toHaveBeenCalledWith(job.id, workerService.workerId, error, job);
      expect(jobErroredListener).toHaveBeenCalledWith(job, error);
    });

    it('should respect concurrency option', async () => {
      const workerOptsConc2: WorkerOptions = { ...workerOptions, concurrency: 2 };
      workerService = new WorkerService(mockQueue, mockProcessor, workerOptsConc2);

      const job1 = createTestJobEntityForWorker('j1');
      const job2 = createTestJobEntityForWorker('j2');
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job1).mockResolvedValueOnce(job2);
      mockProcessor.mockImplementation(() => new Promise<TestWorkerResult>(resolve => setTimeout(() => resolve({ done: true }), 50))); // Slow processor

      workerService.run();
      await vi.advanceTimersByTimeAsync(10); // First poll cycle
      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(10); // Second poll cycle, while first job "processing"

      // Concurrency check is tricky with mocked fetchNextJobAndLock resolving immediately.
      // The key is that processJob is async.
      // We expect fetchNextJobAndLock to be called twice if concurrency allows.
      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(2);
      expect(workerService.activeJobCount).toBe(2);
    });
  });

  describe('lock renewal', () => {
    it('should periodically extend job lock', async () => {
      const job = createTestJobEntityForWorker('job-lock-renew');
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      // Processor takes longer than lockRenewInterval but less than lockDuration
      mockProcessor.mockImplementation(() => new Promise<TestWorkerResult>(resolve => setTimeout(() => resolve({ done: true }), workerOptions.lockDuration! - 1000)));

      workerService.run();
      await vi.advanceTimersByTimeAsync(10); // Fetch job

      // Advance time to just after the first renewal should have happened
      // lockDuration = 10000, lockRenewTimeBuffer = 4000. So renewInterval = 6000ms.
      await vi.advanceTimersByTimeAsync(6050);
      expect(mockQueue.extendJobLock).toHaveBeenCalledWith(job.id, workerService.workerId, workerOptions.lockDuration);

      // Advance close to job completion
      await vi.advanceTimersByTimeAsync(3000); // Total ~9s, processor finishes.
      expect(mockProcessor).toHaveBeenCalled();
      await vi.runAllTimersAsync(); // Ensure processor promise resolves
    });

    it('should clear lock renewal timer after job completion', async () => {
      const job = createTestJobEntityForWorker('job-clear-lock');
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockResolvedValueOnce({ completed: true });
      vi.spyOn(global, 'clearInterval');

      workerService.run();
      await vi.advanceTimersByTimeAsync(100); // Process job

      expect(clearInterval).toHaveBeenCalled();
    });
  });

  describe('job context decoration (updateProgress/addLog)', () => {
    it('job.updateProgress inside processor should call queue.updateJobProgress', async () => {
      const job = createTestJobEntityForWorker('job-progress');
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockImplementation(async (jobArg) => { // Renamed 'j' to 'jobArg'
        jobArg.updateProgress(50); // Call decorated method
        return { done: true };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      expect(mockQueue.updateJobProgress).toHaveBeenCalledWith(job.id, workerService.workerId, 50);
      expect(job.progress).toBe(50); // Also check in-memory update
    });

    it('job.addLog inside processor should call queue.addJobLog', async () => {
      const job = createTestJobEntityForWorker('job-log');
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job);
      mockProcessor.mockImplementation(async (jobArg) => { // Renamed 'j' to 'jobArg'
        jobArg.addLog('Processor log', 'INFO');
        return { done: true };
      });

      workerService.run();
      await vi.advanceTimersByTimeAsync(100);

      expect(mockQueue.addJobLog).toHaveBeenCalledWith(job.id, workerService.workerId, 'Processor log', 'INFO');
      expect(job.logs.find(l => l.message === 'Processor log')).toBeDefined();
    });
  });

  describe('close (graceful shutdown)', () => {
    it('should stop polling for new jobs and wait for active jobs to complete', async () => {
      const job1 = createTestJobEntityForWorker('j-active1');
      let job1PromiseResolveFunction: (value: TestWorkerResult | PromiseLike<TestWorkerResult>) => void = () => {}; // Type the resolver
      const job1Promise = new Promise<TestWorkerResult>(resolve => { job1PromiseResolveFunction = resolve; });

      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(job1);
      mockProcessor.mockImplementation(() => job1Promise); // Job that takes time

      workerService.run();
      await vi.advanceTimersByTimeAsync(10); // job1 is fetched and starts processing

      expect(workerService.activeJobCount).toBe(1);

      const closePromise = workerService.close(); // Initiate close

      // Worker should not fetch new jobs now
      mockQueue.fetchNextJobAndLock.mockResolvedValueOnce(createTestJobEntityForWorker('j-new'));
      await vi.advanceTimersByTimeAsync(2000); // Advance polling interval
      expect(mockQueue.fetchNextJobAndLock).toHaveBeenCalledTimes(1); // Still 1, no new job fetched

      expect(workerService.isClosed).toBe(true);
      expect(workerService.isRunning).toBe(false); // Polling loop should stop

      // Complete job1
      const job1Result: TestWorkerResult = { completed: true };
      job1PromiseResolveFunction(job1Result); // Resolve with typed result
      await closePromise; // Wait for close to finish

      expect(workerService.activeJobCount).toBe(0);
      expect(mockQueue.markJobAsCompleted).toHaveBeenCalledWith(job1.id, workerService.workerId, job1Result, job1);
    });

    it('should emit worker.closed event', async () => {
      const closedEventSpy = vi.fn();
      workerService.on('worker.closed', closedEventSpy);

      workerService.run(); // Start the worker
      await vi.advanceTimersByTimeAsync(10); // Let it poll once perhaps
      await workerService.close(); // Close it

      // Ensure assertions are made
      expect(closedEventSpy).toHaveBeenCalled();
    });
  });

  describe('error handling in worker itself', () => {
    it('should emit worker.error if queue.fetchNextJobAndLock fails', async () => {
        const error = new Error("Queue fetch failed");
        mockQueue.fetchNextJobAndLock.mockRejectedValueOnce(error);
        const errorListener = vi.fn();
        workerService.on('worker.error', errorListener);

        workerService.run();
        await vi.advanceTimersByTimeAsync(100);

        expect(errorListener).toHaveBeenCalledWith(error);
    });
  });
});
