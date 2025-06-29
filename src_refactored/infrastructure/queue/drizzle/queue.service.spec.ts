import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

import { QueueService } from './queue.service';

// Define more specific types for payload and result for these tests
interface TestQueuePayload { data?: string; to?: string; [key: string]: unknown; }
interface TestQueueResult { success?: boolean; [key: string]: unknown; }

// Helper to create a JobEntity instance for tests
const createTestJobEntity = (
  id?: string,
  options?: IJobOptions,
  payload: TestQueuePayload = { data: 'test' }
): JobEntity<TestQueuePayload, TestQueueResult> => {
  return JobEntity.create<TestQueuePayload, TestQueueResult>({
    id: id ? JobIdVO.create(id) : undefined,
    queueName: 'test-queue',
    name: 'test-job-name',
    payload,
    options: { attempts: 1, priority: 10, ...options },
  });
};

describe('QueueService', () => {
  let queueService: QueueService<TestQueuePayload, TestQueueResult>;
  let mockJobRepository: MockProxy<IJobRepository>;

  const queueName = 'test-queue';
  const defaultJobOpts: IJobOptions = { priority: 5, attempts: 2 };

  beforeEach(() => {
    mockJobRepository = mock<IJobRepository>();
    queueService = new QueueService(queueName, mockJobRepository, defaultJobOpts);
    vi.useFakeTimers(); // Use fake timers for stalledJobsManager
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore any mocks
    vi.clearAllTimers(); // Clear all timers
  });

  describe('add', () => {
    it('should create a job with merged options, save it, and emit job.added', async () => {
      const jobName = 'email-job';
      const payload = { to: 'user@example.com' };
      const jobSpecificOpts: IJobOptions = { attempts: 5 }; // Override default attempts

      // Remove unused 'savedJob' variable and its capturing logic
      // mockJobRepository.save.mockImplementation(async (_jobToSave: JobEntity<TestQueuePayload, TestQueueResult>) => {});

      const addedJob = await queueService.add(jobName, payload, jobSpecificOpts);

      expect(addedJob).toBeDefined();
      expect(addedJob.name).toBe(jobName);
      expect(addedJob.payload).toEqual(payload);
      expect(addedJob.queueName).toBe(queueName);
      expect(addedJob.options.attempts).toBe(5); // Job specific
      expect(addedJob.options.priority).toBe(5); // From default
      expect(mockJobRepository.save).toHaveBeenCalledWith(addedJob);
      // TODO: Test event emission (requires spying on queueService.emit or adding listeners)
    });
  });

  describe('fetchNextJobAndLock', () => {
    it('should fetch, lock, and return the next job', async () => {
      const job = createTestJobEntity();
      job.props.status = JobStatus.WAITING; // Ensure it's waiting
      mockJobRepository.findNextJobsToProcess.mockResolvedValueOnce([job]);
      mockJobRepository.acquireLock.mockResolvedValueOnce(true);

      const fetchedJob = await queueService.fetchNextJobAndLock('worker-1', 30000);

      expect(mockJobRepository.findNextJobsToProcess).toHaveBeenCalledWith(queueName, 1);
      expect(mockJobRepository.acquireLock).toHaveBeenCalled();
      expect(fetchedJob).toBeDefined();
      expect(fetchedJob!.id.equals(job.id)).toBe(true);
      expect(fetchedJob!.status).toBe(JobStatus.ACTIVE);
      expect(mockJobRepository.update).toHaveBeenCalledWith(fetchedJob);
      // TODO: Test event emission 'job.active'
    });

    it('should return null if no job is available', async () => {
      mockJobRepository.findNextJobsToProcess.mockResolvedValueOnce([]);
      const fetchedJob = await queueService.fetchNextJobAndLock('worker-1', 30000);
      expect(fetchedJob).toBeNull();
    });

    it('should return null if lock cannot be acquired', async () => {
      const job = createTestJobEntity();
      job.props.status = JobStatus.WAITING;
      mockJobRepository.findNextJobsToProcess.mockResolvedValueOnce([job]);
      mockJobRepository.acquireLock.mockResolvedValueOnce(false); // Lock acquisition fails

      const fetchedJob = await queueService.fetchNextJobAndLock('worker-1', 30000);
      expect(fetchedJob).toBeNull();
      expect(mockJobRepository.update).not.toHaveBeenCalled(); // Job should not be updated to ACTIVE
    });
  });

  describe('markJobAsCompleted', () => {
    it('should use jobInstanceWithChanges, update status, save, and emit event', async () => {
      const jobInstance = createTestJobEntity('job1');
      jobInstance.moveToActive('worker-1', new Date(Date.now() + 30000));
      jobInstance.addLog('Processing started'); // Log added by worker
      const result: TestQueueResult = { success: true };

      await queueService.markJobAsCompleted(jobInstance.id, 'worker-1', result, jobInstance);

      expect(jobInstance.status).toBe(JobStatus.COMPLETED);
      expect(jobInstance.returnValue).toEqual(result);
      expect(jobInstance.logs.length).toBe(1); // Ensure logs from instance are there
      expect(mockJobRepository.update).toHaveBeenCalledWith(jobInstance);
      // TODO: Test 'job.completed' event
    });
  });

  describe('markJobAsFailed', () => {
    it('should move to DELAYED if attempts remain, using jobInstanceWithChanges', async () => {
      const jobInstance = createTestJobEntity('job-fail-retry', { attempts: 3 });
      jobInstance.moveToActive('worker-1', new Date(Date.now() + 30000)); // attemptsMade becomes 1
      jobInstance.addLog('Attempt 1 log');
      const error = new Error('Failed attempt');

      await queueService.markJobAsFailed(jobInstance.id, 'worker-1', error, jobInstance);

      expect(jobInstance.status).toBe(JobStatus.DELAYED);
      expect(jobInstance.attemptsMade).toBe(1);
      expect(jobInstance.failedReason).toBe(error.message);
      expect(jobInstance.logs.length).toBe(1);
      expect(mockJobRepository.update).toHaveBeenCalledWith(jobInstance);
      // TODO: Test 'job.failed' event
    });

    it('should move to FAILED if no attempts remain, using jobInstanceWithChanges', async () => {
      const jobInstance = createTestJobEntity('job-fail-final', { attempts: 1 });
      jobInstance.moveToActive('worker-1', new Date(Date.now() + 30000)); // attemptsMade becomes 1
      const error = new Error('Final failure');

      await queueService.markJobAsFailed(jobInstance.id, 'worker-1', error, jobInstance);

      expect(jobInstance.status).toBe(JobStatus.FAILED);
      expect(jobInstance.failedReason).toBe(error.message);
      expect(mockJobRepository.update).toHaveBeenCalledWith(jobInstance);
    });
  });

  describe('startMaintenance (StalledJobsManager)', () => {
    it('should periodically find and process stalled jobs', async () => {
      const stalledJob1 = createTestJobEntity('stalled1', { attempts: 3 });
      stalledJob1.moveToActive('w-stalled', new Date(Date.now() - 60000)); // Lock expired
      (stalledJob1.props as unknown as { attemptsMade: number }).attemptsMade = 1; // Type assertion for test modification


      const stalledJob2Fail = createTestJobEntity('stalled2-fail', { attempts: 1 });
      stalledJob2Fail.moveToActive('w-stalled2', new Date(Date.now() - 60000)); // Lock expired
      (stalledJob2Fail.props as unknown as { attemptsMade: number }).attemptsMade = 1; // Type assertion for test modification


      mockJobRepository.findStalledJobs.mockResolvedValueOnce([stalledJob1, stalledJob2Fail]);

      queueService.startMaintenance();
      await vi.advanceTimersByTimeAsync(15000); // Advance past one interval

      expect(mockJobRepository.findStalledJobs).toHaveBeenCalledWith(queueName, expect.any(Date), 10);

      // Check stalledJob1 (should be DELAYED for retry)
      expect(stalledJob1.status).toBe(JobStatus.DELAYED);
      expect(stalledJob1.logs.some(logEntry => logEntry.message.includes('stalled'))).toBe(true); // Renamed 'l'
      expect(stalledJob1.failedReason).toBe('Job stalled and retried');

      // Check stalledJob2Fail (should be FAILED)
      expect(stalledJob2Fail.status).toBe(JobStatus.FAILED);
      expect(stalledJob2Fail.logs.some(logEntry => logEntry.message.includes('stalled'))).toBe(true); // Renamed 'l'
      expect(stalledJob2Fail.failedReason).toBe('Job failed after becoming stalled and exceeding max attempts.');

      expect(mockJobRepository.update).toHaveBeenCalledWith(stalledJob1);
      expect(mockJobRepository.update).toHaveBeenCalledWith(stalledJob2Fail);
      // TODO: Test 'job.stalled' and 'job.failed' events
    });

    it('should not start maintenance if already started', () => {
        queueService.startMaintenance(); // First call
        const firstManager = (queueService['stalledJobsManager' as keyof QueueService<TestQueuePayload, TestQueueResult>]);
        queueService.startMaintenance(); // Second call
        const secondManager = (queueService['stalledJobsManager' as keyof QueueService<TestQueuePayload, TestQueueResult>]);
        expect(secondManager).toBe(firstManager); // Should be the same interval ID
        expect(firstManager).not.toBeNull();
    });
  });

  describe('close', () => {
    it('should clear the stalledJobsManager interval', () => {
        queueService.startMaintenance();
        const manager = (queueService['stalledJobsManager' as keyof QueueService<TestQueuePayload, TestQueueResult>]);
        expect(manager).not.toBeNull();

        vi.spyOn(global, 'clearInterval');
        queueService.close();

        expect(clearInterval).toHaveBeenCalledWith(manager);
        // TODO: Test 'queue.closed' event
    });
  });

  // TODO: Add tests for event emissions using spies or listeners.
  // Example for one event:
  it('should emit job.added event on add', (done) => {
    const jobName = 'event-job';
    const payload: TestQueuePayload = { data: 'event-payload' }; // Typed payload

    queueService.on('job.added', (jobEmitted: JobEntity<TestQueuePayload, TestQueueResult>) => { // Typed emitted job
      expect(jobEmitted.name).toBe(jobName);
      done(); // Vitest done callback for async event test
    });

    queueService.add(jobName, payload, {});
  });

});
