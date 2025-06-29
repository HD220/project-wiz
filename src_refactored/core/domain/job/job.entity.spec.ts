import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DomainError } from '@/core/domain/common/errors';

import { JobEntity, JobStatus } from './job.entity'; // JobLogEntry removed
import { JobIdVO } from './value-objects/job-id.vo';
import { JobOptionsVO, IJobOptions } from './value-objects/job-options.vo';

// Mock Date
const MOCK_DATE = new Date('2023-01-01T00:00:00.000Z');
vi.setSystemTime(MOCK_DATE);

// Define more specific types for payload and result for these tests
interface TestPayload { test?: string; key?: string; [key: string]: unknown; }
interface TestResult { result?: string; error?: string; success?: boolean; [key: string]: unknown }


describe('JobEntity', () => {
  let defaultJobProps: {
    queueName: string;
    name: string;
    payload: TestPayload; // Use TestPayload
    options?: IJobOptions;
  };

  beforeEach(() => {
    defaultJobProps = {
      queueName: 'test-queue',
      name: 'test-job',
      payload: { test: 'data' }, // Default payload
    };
    vi.setSystemTime(MOCK_DATE); // Reset time for each test
  });

  describe('create', () => {
    it('should create a JobEntity with default options', () => {
      const job = JobEntity.create(defaultJobProps);
      expect(job).toBeInstanceOf(JobEntity);
      expect(job.id).toBeInstanceOf(JobIdVO);
      expect(job.queueName).toBe(defaultJobProps.queueName);
      expect(job.name).toBe(defaultJobProps.name);
      expect(job.payload).toEqual(defaultJobProps.payload);
      expect(job.status).toBe(JobStatus.WAITING);
      expect(job.attemptsMade).toBe(0);
      expect(job.progress).toBe(0);
      expect(job.logs).toEqual([]);
      expect(job.createdAt).toEqual(MOCK_DATE);
      expect(job.updatedAt).toEqual(MOCK_DATE);
      expect(job.options.priority).toBe(10); // Default priority
    });

    it('should create a JobEntity with provided options', () => {
      const options: IJobOptions = { priority: 5, attempts: 3 };
      const job = JobEntity.create({ ...defaultJobProps, options });
      expect(job.options.priority).toBe(5);
      expect(job.options.attempts).toBe(3);
    });

    it('should set status to DELAYED and define delayUntil if delay option is provided', () => {
      const delayMs = 5000;
      const job = JobEntity.create({ ...defaultJobProps, options: { delay: delayMs } });
      expect(job.status).toBe(JobStatus.DELAYED);
      expect(job.delayUntil).toEqual(new Date(MOCK_DATE.getTime() + delayMs));
    });
  });

  describe('fromPersistence', () => {
    it('should correctly rehydrate a JobEntity from persisted data', () => {
      // Define a more specific type for persistedProps based on JobEntityProps structure
      // This type should align with the input type of JobEntity.fromPersistence
      type InputForFromPersistence = Parameters<typeof JobEntity.fromPersistence<TestPayload, TestResult>>[0];

      const persistedProps: InputForFromPersistence = {
        id: JobIdVO.create().value,
        queueName: 'q',
        name: 'n',
        payload: { key: 'val' }, // This is TestPayload
        options: { priority: 1, attempts: 1, delay: 0, removeOnComplete: false, removeOnFail: false, storePayload: true },
        status: JobStatus.ACTIVE,
        attemptsMade: 1,
        progress: 50,
        logs: [{ message: 'log1', level: 'INFO', timestamp: MOCK_DATE.getTime() }],
        createdAt: MOCK_DATE.getTime(),
        updatedAt: MOCK_DATE.getTime(),
        processedOn: MOCK_DATE.getTime(),
        lockUntil: new Date(MOCK_DATE.getTime() + 30000).getTime(),
        workerId: 'worker-1',
        // Ensure all properties expected by JobEntityProps (after Omit) are present or explicitly undefined if optional
        finishedOn: undefined,
        delayUntil: undefined,
        returnValue: undefined,
        failedReason: undefined,
        stacktrace: undefined,
      };
      const job = JobEntity.fromPersistence(persistedProps);

      expect(job.id.value).toBe(persistedProps.id);
      expect(job.options).toBeInstanceOf(JobOptionsVO);
      expect(job.options.priority).toBe(1);
      expect(job.status).toBe(JobStatus.ACTIVE);
      expect(job.logs[0].timestamp).toEqual(MOCK_DATE);
      expect(job.createdAt).toEqual(MOCK_DATE);
      expect(job.lockUntil).toEqual(new Date(MOCK_DATE.getTime() + 30000));
    });
  });

  describe('toPersistence', () => {
    it('should correctly serialize a JobEntity for persistence', () => {
      const job = JobEntity.create(defaultJobProps);
      job.moveToActive('worker-1', new Date(MOCK_DATE.getTime() + 10000));
      job.addLog('test log');

      const persisted = job.toPersistence();

      expect(persisted.id).toBe(job.id.value);
      expect(typeof persisted.options.priority).toBe('number'); // IJobOptions
      expect(persisted.status).toBe(JobStatus.ACTIVE);
      expect(persisted.logs[0].timestamp).toBe(MOCK_DATE.getTime());
      expect(persisted.createdAt).toBe(MOCK_DATE.getTime());
      expect(persisted.lockUntil).toBe(new Date(MOCK_DATE.getTime() + 10000).getTime());
    });
  });

  describe('updateProgress', () => {
    it('should update progress and updatedAt', () => {
      const job = JobEntity.create(defaultJobProps);
      const newProgress = 50;
      const laterDate = new Date(MOCK_DATE.getTime() + 1000);
      vi.setSystemTime(laterDate);

      job.updateProgress(newProgress);
      expect(job.progress).toBe(newProgress);
      expect(job.updatedAt).toEqual(laterDate);
      expect(job.progressChanged).toBe(true);
    });

    it('should not update progress if job is COMPLETED', () => {
      const job = JobEntity.create(defaultJobProps);
      job.markAsCompleted({ result: 'done' });
      const originalProgress = job.progress;
      vi.spyOn(console, 'warn');
      job.updateProgress(100);
      expect(job.progress).toBe(originalProgress);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Cannot update progress'));
    });
  });

  describe('addLog', () => {
    it('should add a log entry and update updatedAt', () => {
      const job = JobEntity.create(defaultJobProps);
      const laterDate = new Date(MOCK_DATE.getTime() + 1000);
      vi.setSystemTime(laterDate);

      job.addLog('New log message', 'DEBUG');
      expect(job.logs.length).toBe(1);
      expect(job.logs[0].message).toBe('New log message');
      expect(job.logs[0].level).toBe('DEBUG');
      expect(job.logs[0].timestamp).toEqual(laterDate);
      expect(job.updatedAt).toEqual(laterDate);
      expect(job.logsChanged).toBe(true);
    });

    it('should allow adding logs to a COMPLETED job', () => {
      const job = JobEntity.create(defaultJobProps);
      job.markAsCompleted({ success: true });
      job.addLog('Post-completion log');
      expect(job.logs.length).toBe(1);
      expect(job.logs[0].message).toBe('Post-completion log');
    });
  });

  describe('clearChangeFlags', () => {
    it('should reset progressChanged and logsChanged flags', () => {
      const job = JobEntity.create(defaultJobProps);
      job.updateProgress(10);
      job.addLog('a log');
      expect(job.progressChanged).toBe(true);
      expect(job.logsChanged).toBe(true);
      job.clearChangeFlags();
      expect(job.progressChanged).toBe(false);
      expect(job.logsChanged).toBe(false);
    });
  });

  describe('Lifecycle Methods', () => {
    let job: JobEntity<TestPayload, TestResult>; // Use defined Test types

    beforeEach(() => {
      job = JobEntity.create(defaultJobProps);
    });

    it('moveToActive should set status to ACTIVE and update relevant fields', () => {
      const workerId = 'worker-active';
      const lockUntil = new Date(MOCK_DATE.getTime() + 30000);
      job.moveToActive(workerId, lockUntil);

      expect(job.status).toBe(JobStatus.ACTIVE);
      expect(job.workerId).toBe(workerId);
      expect(job.lockUntil).toEqual(lockUntil);
      expect(job.processedOn).toEqual(MOCK_DATE);
      expect(job.attemptsMade).toBe(1);
    });

    it('moveToActive should throw if job is not in a valid state', () => {
      job.markAsCompleted({ result: 'done' });
      expect(() => job.moveToActive('w1', new Date())).toThrow(DomainError);
    });

    it('extendLock should update lockUntil', () => {
        const workerId = 'worker-extend';
        const initialLockUntil = new Date(MOCK_DATE.getTime() + 10000);
        job.moveToActive(workerId, initialLockUntil);

        const newLockUntil = new Date(MOCK_DATE.getTime() + 20000);
        const laterTime = new Date(MOCK_DATE.getTime() + 1000);
        vi.setSystemTime(laterTime);
        job.extendLock(newLockUntil, workerId);

        expect(job.lockUntil).toEqual(newLockUntil);
        expect(job.updatedAt).toEqual(laterTime);
    });

    it('extendLock should throw if not ACTIVE or workerId mismatch', () => {
        expect(() => job.extendLock(new Date(), 'w1')).toThrow(DomainError); // Not active
        job.moveToActive('w1', new Date());
        expect(() => job.extendLock(new Date(), 'w2')).toThrow(DomainError); // Worker mismatch
    });

    it('markAsCompleted should set status to COMPLETED and store result', () => {
      job.moveToActive('w1', new Date());
      const result = { result: 'success' };
      job.markAsCompleted(result);

      expect(job.status).toBe(JobStatus.COMPLETED);
      expect(job.returnValue).toEqual(result);
      expect(job.finishedOn).toEqual(MOCK_DATE);
      expect(job.failedReason).toBeUndefined();
      expect(job.workerId).toBeUndefined();
      expect(job.lockUntil).toBeUndefined();
    });

    it('markAsFailed should set status to FAILED and store reason', () => {
      job.moveToActive('w1', new Date());
      const reason = 'It broke';
      const stack = ['line1', 'line2'];
      job.markAsFailed(reason, stack);

      expect(job.status).toBe(JobStatus.FAILED);
      expect(job.failedReason).toBe(reason);
      expect(job.stacktrace).toEqual(stack);
      expect(job.finishedOn).toEqual(MOCK_DATE);
      expect(job.workerId).toBeUndefined();
    });

    it('moveToDelayed should set status to DELAYED', () => {
      job.moveToActive('w1', new Date());
      const delayUntil = new Date(MOCK_DATE.getTime() + 5000);
      const error = new Error('Temporary failure');
      job.moveToDelayed(delayUntil, error);

      expect(job.status).toBe(JobStatus.DELAYED);
      expect(job.delayUntil).toEqual(delayUntil);
      expect(job.failedReason).toBe(error.message); // Keeps last error reason
      expect(job.processedOn).toBeUndefined();
      expect(job.workerId).toBeUndefined();
    });

    it('moveToWaiting should set status to WAITING', () => {
      job.moveToDelayed(new Date(MOCK_DATE.getTime() + 1000));
      job.moveToWaiting();
      expect(job.status).toBe(JobStatus.WAITING);
      expect(job.delayUntil).toBeUndefined();
    });

    it('pause should set status to PAUSED if WAITING or DELAYED', () => {
        job.pause(); // Starts WAITING
        expect(job.status).toBe(JobStatus.PAUSED);

        const delayedJob = JobEntity.create({...defaultJobProps, options: {delay:1000}});
        delayedJob.pause();
        expect(delayedJob.status).toBe(JobStatus.PAUSED);
    });

    it('pause should throw if not WAITING or DELAYED', () => {
        job.moveToActive('w1', new Date());
        expect(() => job.pause()).toThrow(DomainError);
    });

    it('resume should set status to WAITING or DELAYED from PAUSED', () => {
        job.pause(); // status WAITING -> PAUSED
        job.resume();
        expect(job.status).toBe(JobStatus.WAITING);

        const delayedJob = JobEntity.create({...defaultJobProps, options: {delay: 60000}}); // delay 1min
        delayedJob.pause(); // status DELAYED -> PAUSED
        delayedJob.resume();
        expect(delayedJob.status).toBe(JobStatus.DELAYED); // delayUntil is still in future
        expect(delayedJob.delayUntil).toBeDefined();
    });

    it('resume should throw if not PAUSED', () => {
        expect(() => job.resume()).toThrow(DomainError);
    });

    describe('markAsStalled', () => {
      it('should add a log, clear worker info, and return false if attempts remain', () => {
        job = JobEntity.create({ ...defaultJobProps, options: { attempts: 3 } });
        job.moveToActive('w1', new Date(MOCK_DATE.getTime() - 1000)); // Lock already expired

        const shouldFailPermanently = job.markAsStalled();

        expect(job.logs.some(log => log.message.includes('stalled'))).toBe(true);
        expect(job.workerId).toBeUndefined();
        expect(job.lockUntil).toBeUndefined();
        expect(shouldFailPermanently).toBe(false);
        // Status is not changed by markAsStalled itself, QueueService decides next state
      });

      it('should mark as FAILED and return true if max attempts reached', () => {
        job = JobEntity.create({ ...defaultJobProps, options: { attempts: 1 } });
        job.moveToActive('w1', new Date(MOCK_DATE.getTime() - 1000)); // Attempt 1, lock expired

        const shouldFailPermanently = job.markAsStalled();

        expect(job.status).toBe(JobStatus.FAILED);
        expect(job.failedReason).toContain('exceeding max attempts');
        expect(shouldFailPermanently).toBe(true);
      });
    });
  });

  describe('isRetry getter', () => {
    it('should be false for a new job', () => {
        const job = JobEntity.create(defaultJobProps);
        expect(job.isRetry).toBe(false);
    });

    it('should be false for a first attempt active job', () => {
        const job = JobEntity.create(defaultJobProps);
        job.moveToActive('w1', new Date());
        expect(job.isRetry).toBe(false); // attemptsMade is 1, but not > 1
    });

    it('should be true for a second attempt active job', () => {
        const job = JobEntity.create(defaultJobProps);
        job.moveToActive('w1', new Date()); // attempt 1
        job.moveToDelayed(new Date(), new Error("failed attempt 1")); // Failed, now DELAYED
        job.moveToWaiting(); // Ready for retry
        job.moveToActive('w1', new Date()); // attempt 2 (attemptsMade is now 2)
        expect(job.isRetry).toBe(true);
    });

    it('should be true for a job WAITING/DELAYED after a failure', () => {
        const job = JobEntity.create(defaultJobProps);
        job.moveToActive('w1', new Date()); // attemptsMade becomes 1
        job.moveToDelayed(new Date(), new Error("failed attempt 1")); // attemptsMade is 1, status DELAYED, failedReason set
        expect(job.isRetry).toBe(true);
    });
  });
});
