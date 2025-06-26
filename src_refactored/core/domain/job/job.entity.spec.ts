import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JobEntity, JobEntityConstructionProps } from './job.entity';
import { JobIdVO } from './value-objects/job-id.vo';
import { JobStatusVO, JobStatusEnum } from './value-objects/job-status.vo';
import { JobPriorityVO } from './value-objects/job-priority.vo';
import { JobOptionsVO, IJobOptions } from './value-objects/job-options.vo';
import { JobProgressVO } from './value-objects/job-progress.vo';
import { JobExecutionLogsVO, JobExecutionLogEntryVO, LogLevel } from './value-objects/job-execution-logs.vo';
import { ValueError, DomainError } from '../../common/errors';

describe('JobEntity', () => {
  let baseProps: JobEntityConstructionProps<{ task: string }>;

  beforeEach(() => {
    vi.useFakeTimers();
    const now = new Date(2024, 0, 1, 10, 0, 0); // Jan 1, 2024, 10:00:00
    vi.setSystemTime(now);

    baseProps = {
      queueName: 'test-queue',
      jobName: 'testJob',
      payload: { task: 'do something' },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Creation', () => {
    it('should create a JobEntity with default values', () => {
      const job = JobEntity.create(baseProps);
      expect(job.id).toBeInstanceOf(JobIdVO);
      expect(job.queueName).toBe('test-queue');
      expect(job.jobName).toBe('testJob');
      expect(job.payload).toEqual({ task: 'do something' });
      expect(job.opts).toBeInstanceOf(JobOptionsVO);
      expect(job.status.value).toBe(JobStatusEnum.PENDING);
      expect(job.priority.value).toBe(JobPriorityVO.default().value);
      expect(job.progress.value).toBe(0);
      expect(job.attemptsMade).toBe(0);
      expect(job.createdAt.getTime()).toBe(new Date(2024, 0, 1, 10, 0, 0).getTime());
      expect(job.updatedAt.getTime()).toBe(new Date(2024, 0, 1, 10, 0, 0).getTime());
      expect(job.executionLogs.count()).toBe(0);
      expect(job.processAt).toBeUndefined();
    });

    it('should create a DELAYED job if opts.delay is provided', () => {
      const delay = 5000; // 5 seconds
      const job = JobEntity.create({ ...baseProps, opts: { delay } });
      const expectedProcessAt = Date.now() + delay;
      expect(job.status.value).toBe(JobStatusEnum.DELAYED);
      expect(job.processAt?.getTime()).toBe(expectedProcessAt);
    });

    it('should use provided JobIdVO', () => {
      const id = JobIdVO.generate();
      const job = JobEntity.create({ ...baseProps, id });
      expect(job.id.equals(id)).toBe(true);
    });

    it('should use provided string id', () => {
      const idStr = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const job = JobEntity.create({ ...baseProps, id: idStr });
      expect(job.id.value).toBe(idStr);
    });

    it('should throw ValueError for missing queueName', () => {
      const props = { ...baseProps } as any;
      delete props.queueName;
      expect(() => JobEntity.create(props)).toThrow(ValueError);
    });

    it('should throw ValueError for missing jobName', () => {
      const props = { ...baseProps } as any;
      delete props.jobName;
      expect(() => JobEntity.create(props)).toThrow(ValueError);
    });

    it('should throw ValueError for undefined payload', () => {
      const props = { ...baseProps, payload: undefined as any };
      expect(() => JobEntity.create(props)).toThrow(ValueError);
    });
  });

  describe('Mutators', () => {
    it('setProgress should update progress and updatedAt', () => {
      const job = JobEntity.create(baseProps);
      const initialUpdatedAt = job.updatedAt;
      vi.advanceTimersByTime(100);

      job.setProgress(50);
      expect(job.progress.value).toBe(50);
      expect(job.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());

      job.setProgress({ detail: 'step 1' });
      expect(job.progress.value).toEqual({ detail: 'step 1' });
    });

    it('addLog should add a log entry and update updatedAt', () => {
      const job = JobEntity.create(baseProps);
      const initialLogCount = job.executionLogs.count();
      const initialUpdatedAt = job.updatedAt;
      vi.advanceTimersByTime(100);
      const nowPlus100 = Date.now();

      job.addLog('Test log message', 'DEBUG', { data: 'extra' });
      expect(job.executionLogs.count()).toBe(initialLogCount + 1);
      const lastLog = job.executionLogs.entries[job.executionLogs.count() -1];
      expect(lastLog.message).toBe('Test log message');
      expect(lastLog.level).toBe('DEBUG');
      expect(lastLog.details).toEqual({ data: 'extra' });
      expect(lastLog.timestamp.getTime()).toBe(nowPlus100);
      expect(job.updatedAt.getTime()).toBe(nowPlus100);
    });
  });

  describe('State Transitions', () => {
    let job: JobEntity<{ task: string }>;
    beforeEach(() => {
      job = JobEntity.create(baseProps);
    });

    it('moveToActive should set status to ACTIVE, increment attempts, set timestamps and lock info', () => {
      vi.advanceTimersByTime(1000); // Ensure time moves for startedAt
      const workerId = 'worker-1';
      const lockDuration = 30000;
      const expectedLockExpiresAt = Date.now() + lockDuration;

      const result = job.moveToActive(workerId, lockDuration);
      expect(result).toBe(true);
      expect(job.status.value).toBe(JobStatusEnum.ACTIVE);
      expect(job.attemptsMade).toBe(1);
      expect(job.startedAt?.getTime()).toBe(Date.now());
      expect(job.lockedByWorkerId).toBe(workerId);
      expect(job.lockExpiresAt?.getTime()).toBe(expectedLockExpiresAt);
      expect(job.updatedAt.getTime()).toBe(Date.now());
    });

    it('renewLock should update lockExpiresAt if active and locked by same worker', () => {
      const workerId = 'worker-1';
      job.moveToActive(workerId, 30000);
      vi.advanceTimersByTime(10000); // 10s pass
      const newLockExpiresAt = Date.now() + 30000;

      const result = job.renewLock(newLockExpiresAt, workerId);
      expect(result).toBe(true);
      expect(job.lockExpiresAt?.getTime()).toBe(newLockExpiresAt);
      expect(job.updatedAt.getTime()).toBe(Date.now());
    });

    it('renewLock should fail if not active or different worker', () => {
      expect(job.renewLock(Date.now() + 30000, 'worker-1')).toBe(false); // Not active
      job.moveToActive('worker-1', 30000);
      expect(job.renewLock(Date.now() + 30000, 'worker-2')).toBe(false); // Different worker
    });


    it('moveToCompleted should set status to COMPLETED, set result, finishedAt, progress, and clear lock', () => {
      job.moveToActive('worker-1', 30000);
      vi.advanceTimersByTime(1000);
      const resultData = { success: true };

      const result = job.moveToCompleted(resultData);
      expect(result).toBe(true);
      expect(job.status.value).toBe(JobStatusEnum.COMPLETED);
      expect(job.returnValue).toEqual(resultData);
      expect(job.finishedAt?.getTime()).toBe(Date.now());
      expect(job.progress.value).toBe(100);
      expect(job.lockedByWorkerId).toBeUndefined();
      expect(job.lockExpiresAt).toBeUndefined();
      expect(job.updatedAt.getTime()).toBe(Date.now());
    });

    it('moveToFailed should set status to FAILED, set failedReason, finishedAt, and clear lock', () => {
      job.moveToActive('worker-1', 30000);
      vi.advanceTimersByTime(1000);
      const reason = 'Processing error';

      const result = job.moveToFailed(reason);
      expect(result).toBe(true);
      expect(job.status.value).toBe(JobStatusEnum.FAILED);
      expect(job.failedReason).toBe(reason);
      expect(job.finishedAt?.getTime()).toBe(Date.now());
      expect(job.lockedByWorkerId).toBeUndefined();
      expect(job.lockExpiresAt).toBeUndefined();
      expect(job.updatedAt.getTime()).toBe(Date.now());
    });

    it('moveToDelayed should set status to DELAYED, set processAt, and clear lock', () => {
      job.moveToActive('worker-1', 30000); // Simulate it was active for a retry scenario
      vi.advanceTimersByTime(1000);
      const delayMs = 5000;
      const expectedProcessAt = Date.now() + delayMs;

      const result = job.moveToDelayed(expectedProcessAt);
      expect(result).toBe(true);
      expect(job.status.value).toBe(JobStatusEnum.DELAYED);
      expect(job.processAt?.getTime()).toBe(expectedProcessAt);
      expect(job.lockedByWorkerId).toBeUndefined(); // Lock should be cleared
      expect(job.lockExpiresAt).toBeUndefined();
      expect(job.updatedAt.getTime()).toBe(Date.now());
    });

    it('promoteToPending should change DELAYED job to PENDING and clear processAt', () => {
      const delayedJob = JobEntity.create({ ...baseProps, opts: { delay: 10000 } });
      expect(delayedJob.status.is(JobStatusEnum.DELAYED)).toBe(true);

      vi.advanceTimersByTime(100);
      const result = delayedJob.promoteToPending();
      expect(result).toBe(true);
      expect(delayedJob.status.is(JobStatusEnum.PENDING)).toBe(true);
      expect(delayedJob.processAt).toBeUndefined();
      expect(delayedJob.updatedAt.getTime()).toBe(Date.now());
    });

    it('promoteToPending should change WAITING_CHILDREN job to PENDING', () => {
      // Manually set to WAITING_CHILDREN for test, as create() doesn't directly set it
      const props = { ...job['props'], status: JobStatusVO.waitingChildren() };
      const waitingJob = new (JobEntity as any)(job.id, props); // Use 'any' to bypass private constructor for test

      vi.advanceTimersByTime(100);
      const result = waitingJob.promoteToPending();
      expect(result).toBe(true);
      expect(waitingJob.status.is(JobStatusEnum.PENDING)).toBe(true);
      expect(waitingJob.updatedAt.getTime()).toBe(Date.now());
    });
  });

  describe('isProcessable', () => {
    it('should be processable if PENDING and no processAt or processAt is past', () => {
      const job = JobEntity.create(baseProps); // PENDING, no processAt
      expect(job.isProcessable(Date.now())).toBe(true);

      job['props'].processAt = Date.now() - 1000; // Manually set past processAt for PENDING job
      expect(job.isProcessable(Date.now())).toBe(true);
    });

    it('should not be processable if PENDING but processAt is in future', () => {
      const job = JobEntity.create(baseProps);
      job['props'].processAt = Date.now() + 10000; // Manually set future processAt
      expect(job.isProcessable(Date.now())).toBe(false);
    });

    it('should not be processable if status is not PENDING', () => {
      const activeJob = JobEntity.create(baseProps);
      activeJob.moveToActive('w1', 1000);
      expect(activeJob.isProcessable()).toBe(false);

      const delayedJob = JobEntity.create({...baseProps, opts: {delay:1000}});
      expect(delayedJob.isProcessable()).toBe(false);
    });
  });
});
