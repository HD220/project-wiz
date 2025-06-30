import { randomUUID } from 'node:crypto';

import { DomainError } from '@/core/domain/common/errors';

import { JobEntity, JobStatus } from '../job.entity';
import { JobIdVO } from '../value-objects/job-id.vo';
import { JobOptionsVO } from '../value-objects/job-options.vo';

const 기본JobData = {
  queueName: 'test-queue',
  name: 'test-job',
  payload: { data: 'sample' },
};

describe('JobEntity - Creation', () => {
  it('should create a new job with default values', () => {
    const job = JobEntity.create(기본JobData);

    expect(job).toBeInstanceOf(JobEntity);
    expect(job.id).toBeInstanceOf(JobIdVO);
    expect(job.queueName).toBe('test-queue');
    expect(job.name).toBe('test-job');
    expect(job.payload).toEqual({ data: 'sample' });
    expect(job.options).toBeInstanceOf(JobOptionsVO);
    expect(job.options.attempts).toBe(1);
    expect(job.options.delay).toBe(0);
    expect(job.options.priority).toBe(0);
    expect(job.options.backoff).toBeUndefined();
    expect(job.status).toBe(JobStatus.WAITING);
    expect(job.attemptsMade).toBe(0);
    expect(job.progress).toBe(0);
    expect(job.logs).toEqual([]);
    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.updatedAt).toBeInstanceOf(Date);
    expect(job.processedOn).toBeUndefined();
    expect(job.finishedOn).toBeUndefined();
    expect(job.delayUntil).toBeUndefined();
    expect(job.lockUntil).toBeUndefined();
    expect(job.workerId).toBeUndefined();
    expect(job.returnValue).toBeUndefined();
    expect(job.failedReason).toBeUndefined();
    expect(job.stacktrace).toBeUndefined();
  });

  it('should create a new job with custom options', () => {
    const testJobId = randomUUID();
    const customOptions: Partial<JobOptionsVO> = {
      attempts: 5,
      delay: 1000,
      priority: 10,
      backoff: { type: 'exponential', delay: 500 },
      jobId: testJobId,
      removeOnComplete: true,
      removeOnFail: { count: 5 },
      timeout: 30000,
    };
    const job = JobEntity.create({ ...기본JobData, options: customOptions as Partial<JobOptionsVO> });

    expect(job.id.value).toBe(testJobId);
    expect(job.options.attempts).toBe(5);
    expect(job.options.delay).toBe(1000);
    expect(job.options.priority).toBe(10);
    expect(job.options.backoff).toEqual({ type: 'exponential', delay: 500 });
    expect(job.options.removeOnComplete).toBe(true);
    expect(job.options.removeOnFail).toEqual({ count: 5 });
    expect(job.options.timeout).toBe(30000);
    expect(job.status).toBe(JobStatus.DELAYED);
    expect(job.delayUntil).toBeInstanceOf(Date);
    expect(job.delayUntil!.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + 999);
  });
});

describe('JobEntity - Retry Logic', () => {
  it('should correctly identify if it is a retry of a job', () => {
    const job = JobEntity.create(기본JobData);
    expect(job.isRetry).toBe(false);

    job.moveToActive('worker-1', new Date(Date.now() + 10000));
    expect(job.isRetry).toBe(false);

    job.moveToDelayed(new Date(Date.now() + 5000), new Error("test error"));
    expect(job.isRetry).toBe(true);

    job.moveToActive('worker-1', new Date(Date.now() + 10000));
    expect(job.isRetry).toBe(true);
  });
});

describe('JobEntity - Progress and Logs', () => {
  let job: JobEntity<unknown, unknown>;

  beforeEach(() => {
    job = JobEntity.create(기본JobData);
  });

  it('should update progress', () => {
    job.updateProgress(50);
    expect(job.progress).toBe(50);
    expect(job.updatedAt.getTime()).toBeGreaterThanOrEqual(job.createdAt.getTime());
    job.updateProgress({ detail: 'processing', step: 1 });
    expect(job.progress).toEqual({ detail: 'processing', step: 1 });
  });

  it('should add logs', () => {
    job.addLog('Log message 1');
    expect(job.logs.length).toBe(1);
    expect(job.logs[0].message).toBe('Log message 1');
    expect(job.logs[0].level).toBe('INFO');
    expect(job.logs[0].timestamp).toBeInstanceOf(Date);
    job.addLog('Log message 2', 'WARN');
    expect(job.logs.length).toBe(2);
    expect(job.logs[1].message).toBe('Log message 2');
    expect(job.logs[1].level).toBe('WARN');
  });
});

describe('JobEntity - Lock Management', () => {
  let job: JobEntity<unknown, unknown>;

  beforeEach(() => {
    job = JobEntity.create(기본JobData);
    job.moveToActive('worker-A', new Date(Date.now() + 20000));
  });

  it('should extend lock', () => {
    const originalLockUntil = job.lockUntil;
    const newLockUntil = new Date(Date.now() + 30000);
    job.extendLock(newLockUntil, 'worker-A');
    expect(job.lockUntil).toEqual(newLockUntil);
    expect(job.lockUntil!.getTime()).toBeGreaterThan(originalLockUntil!.getTime());
    expect(job.updatedAt.getTime()).toBeGreaterThanOrEqual(job.processedOn!.getTime());
  });

  it('should not extend lock if workerId does not match', () => {
    const newLockUntil = new Date(Date.now() + 30000);
    expect(() => job.extendLock(newLockUntil, 'worker-B')).toThrow(DomainError);
    expect(() => job.extendLock(newLockUntil, 'worker-B')).toThrow('Cannot extend lock for job');
  });

  it('should not extend lock if job is not active', () => {
    job.markAsCompleted({ result: 'done' });
    const newLockUntil = new Date(Date.now() + 30000);
    expect(() => job.extendLock(newLockUntil, 'worker-A')).toThrow(DomainError);
    expect(() => job.extendLock(newLockUntil, 'worker-A')).toThrow('Cannot extend lock for job');
  });
});
