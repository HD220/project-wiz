import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { JobEntity, JobStatus } from '../job.entity';

const 기본JobData = {
  queueName: 'test-queue',
  name: 'test-job',
  payload: { data: 'sample' },
};

describe('JobEntity - State Transitions', () => {
  let job: JobEntity<{ data: string }, { result: string }>;

  beforeEach(() => {
    vi.useFakeTimers();
    job = JobEntity.create(기본JobData);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should transition to ACTIVE', () => {
    const lockUntil = new Date(Date.now() + 10000);
    job.moveToActive('worker-123', lockUntil);

    expect(job.status).toBe(JobStatus.ACTIVE);
    expect(job.workerId).toBe('worker-123');
    expect(job.lockUntil).toEqual(lockUntil);
    expect(job.processedOn).toBeInstanceOf(Date);
    expect(job.attemptsMade).toBe(1);
    expect(job.updatedAt.getTime()).toBeGreaterThanOrEqual(job.createdAt.getTime());
  });

  it('should transition to COMPLETED', () => {
    job.moveToActive('worker-123', new Date(Date.now() + 10000));
    const result = { result: 'success' };
    job.markAsCompleted(result);

    expect(job.status).toBe(JobStatus.COMPLETED);
    expect(job.returnValue).toEqual(result);
    expect(job.finishedOn).toBeInstanceOf(Date);
    expect(job.lockUntil).toBeUndefined();
    expect(job.workerId).toBeUndefined();
    expect(job.updatedAt.getTime()).toBeGreaterThanOrEqual(job.processedOn!.getTime());
  });

  it('should transition to FAILED if attempts exhausted', () => {
    const jobWithOneAttempt = JobEntity.create({
      ...기본JobData,
      options: { attempts: 1 }
    });
    jobWithOneAttempt.moveToActive('worker-123', new Date(Date.now() + 10000));
    const error = new Error('Test failure');
    jobWithOneAttempt.markAsFailed(error.message, error.stack?.split('\n'));

    expect(jobWithOneAttempt.status).toBe(JobStatus.FAILED);
    expect(jobWithOneAttempt.failedReason).toBe('Test failure');
    expect(jobWithOneAttempt.stacktrace).toEqual(error.stack?.split('\n'));
    expect(jobWithOneAttempt.finishedOn).toBeInstanceOf(Date);
    expect(jobWithOneAttempt.lockUntil).toBeUndefined();
    expect(jobWithOneAttempt.workerId).toBeUndefined();
  });

  it('should transition to DELAYED if retries are pending', () => {
    const jobWithRetries = JobEntity.create({
      ...기본JobData,
      options: { attempts: 3, backoff: { type: 'fixed' as const, delay: 1000 } }
    });
    jobWithRetries.moveToActive('worker-123', new Date(Date.now() + 10000));
    const error = new Error('Transient error');
    const backoffDelay = 1000;
    jobWithRetries.moveToDelayed(new Date(Date.now() + backoffDelay), error);

    expect(jobWithRetries.status).toBe(JobStatus.DELAYED);
    expect(jobWithRetries.failedReason).toBe('Transient error');
    expect(jobWithRetries.delayUntil).toBeInstanceOf(Date);
    expect(jobWithRetries.delayUntil!.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + (backoffDelay -1));
    expect(jobWithRetries.lockUntil).toBeUndefined();
    expect(jobWithRetries.workerId).toBeUndefined();
    expect(jobWithRetries.attemptsMade).toBe(1);
  });

  it('moveToDelayed should correctly set delayUntil and failedReason', async () => {
    const error = new Error('Specific error for delay');
    const futureDate = new Date(Date.now() + 60000);
    await vi.advanceTimersByTimeAsync(10);
    job.moveToDelayed(futureDate, error);
    expect(job.status).toBe(JobStatus.DELAYED);
    expect(job.delayUntil).toEqual(futureDate);
    expect(job.failedReason).toBe(error.message);
    expect(job.updatedAt.getTime()).not.toEqual(job.createdAt.getTime());
  });

  it('should transition to FAILED (via markAsStalled) if attempts exhausted', () => {
    const jobStallFail = JobEntity.create({ ...기본JobData, options: { attempts: 1 } });
    jobStallFail.moveToActive('w1', new Date(Date.now() + 100));
    const shouldFailPermanently = jobStallFail.markAsStalled();
    expect(shouldFailPermanently).toBe(true);
    expect(jobStallFail.status).toBe(JobStatus.FAILED);
    expect(jobStallFail.failedReason).toContain('Job failed after becoming stalled');
    expect(jobStallFail.lockUntil).toBeUndefined();
    expect(jobStallFail.workerId).toBeUndefined();
  });

  it('should return false from markAsStalled if retries are pending', () => {
    const jobStallWait = JobEntity.create({ ...기본JobData, options: { attempts: 2 } });
    jobStallWait.moveToActive('w1', new Date(Date.now() + 100));
    const shouldFailPermanently = jobStallWait.markAsStalled();
    expect(shouldFailPermanently).toBe(false);
    expect(jobStallWait.status).toBe(JobStatus.ACTIVE);
    expect(jobStallWait.lockUntil).toBeUndefined();
    expect(jobStallWait.workerId).toBeUndefined();
  });
});
