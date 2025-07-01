import { randomUUID } from 'node:crypto';

import { describe, it, expect } from 'vitest';

import { JobEntity, JobStatus } from '../job.entity';
import { JobOptionsVO } from '../value-objects/job-options.vo';

const 기본JobData = {
  queueName: 'test-queue',
  name: 'test-job',
  payload: { data: 'sample' },
};

describe('JobEntity - Serialization (toPersistence)', () => {
  it('should correctly serialize to persistence object', () => {
    const testPersistId = randomUUID();
    const customOptions = JobOptionsVO.create({
      attempts: 3,
      delay: 5000,
      priority: 1,
      backoff: { type: 'exponential' as const, delay: 1000 },
      jobId: testPersistId,
      removeOnComplete: true,
      removeOnFail: false,
      timeout: 60000,
      maxStalledCount: 3,
    });
    const job = JobEntity.create<{msg: string}, {res: string}>({
      queueName: 'persist-queue',
      name: 'persist-job',
      payload: { msg: 'hello' },
      options: customOptions.toPersistence(),
    });

    const lockUntil = new Date(Date.now() + 10000);
    job.moveToActive('worker-p', lockUntil);
    job.updateProgress(50);
    job.addLog('Persistence log 1');

    const persistenceObject = job.toPersistence();

    expect(persistenceObject.id).toBe(testPersistId);
    expect(persistenceObject.queueName).toBe('persist-queue');
    expect(persistenceObject.name).toBe('persist-job');
    expect(persistenceObject.payload).toEqual({ msg: 'hello' });
    expect(persistenceObject.options).toEqual(customOptions.toPersistence());
    expect(persistenceObject.status).toBe(JobStatus.ACTIVE);
    expect(persistenceObject.attemptsMade).toBe(1);
    expect(persistenceObject.progress).toBe(50);
    expect(persistenceObject.logs.length).toBe(1);
    expect(persistenceObject.logs[0].message).toBe('Persistence log 1');
    expect(persistenceObject.createdAt).toEqual(job.createdAt);
    expect(persistenceObject.updatedAt).toEqual(job.updatedAt);
    expect(persistenceObject.processedOn).toEqual(job.processedOn);
    expect(persistenceObject.finishedOn).toBeUndefined();
    expect(persistenceObject.delayUntil).toEqual(job.delayUntil);
    expect(persistenceObject.lockUntil).toEqual(lockUntil);
    expect(persistenceObject.workerId).toBe('worker-p');
    expect(persistenceObject.returnValue).toBeUndefined();
    expect(persistenceObject.failedReason).toBeUndefined();
    expect(persistenceObject.stacktrace).toBeUndefined();
    expect(persistenceObject.stalledCount).toBe(0);
  });

  it('should correctly serialize a completed job to persistence object', () => {
    const job = JobEntity.create<{data: string}, {done: boolean}>(기본JobData);
    job.moveToActive('w1', new Date());
    job.markAsCompleted({ done: true });
    const persistenceObject = job.toPersistence();

    expect(persistenceObject.status).toBe(JobStatus.COMPLETED);
    expect(persistenceObject.returnValue).toEqual({ done: true });
    expect(persistenceObject.finishedOn).toEqual(job.finishedOn);
    expect(persistenceObject.lockUntil).toBeUndefined();
    expect(persistenceObject.workerId).toBeUndefined();
  });
});
