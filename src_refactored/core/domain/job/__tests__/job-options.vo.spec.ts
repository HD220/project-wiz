import { randomUUID } from 'node:crypto';

import { describe, it, expect } from 'vitest';

import { JobOptionsVO } from '../value-objects/job-options.vo';

describe('JobOptionsVO', () => {
  it('should create with default values', () => {
    const opts = JobOptionsVO.create({});
    expect(opts.attempts).toBe(1);
    expect(opts.delay).toBe(0);
    expect(opts.priority).toBe(0);
    expect(opts.jobId).toBeUndefined();
    expect(opts.removeOnComplete).toBe(true);
    expect(opts.removeOnFail).toBe(false);
    expect(opts.timeout).toBeUndefined();
    expect(opts.backoff).toBeUndefined();
    expect(opts.maxStalledCount).toBe(3);
  });

  it('should create with provided values', () => {
    const testJobIdString = randomUUID();
    const backoff = { type: 'exponential' as const, delay: 1000 };
    const opts = JobOptionsVO.create({
      attempts: 5,
      delay: 2000,
      priority: 3,
      jobId: testJobIdString,
      removeOnComplete: true,
      removeOnFail: { count: 10 },
      timeout: 5000,
      backoff: backoff,
      maxStalledCount: 5,
    });
    expect(opts.attempts).toBe(5);
    expect(opts.delay).toBe(2000);
    expect(opts.priority).toBe(3);
    expect(opts.jobId).toBe(testJobIdString);
    expect(opts.removeOnComplete).toBe(true);
    expect(opts.removeOnFail).toEqual({ count: 10 });
    expect(opts.timeout).toBe(5000);
    expect(opts.backoff).toEqual(backoff);
    expect(opts.maxStalledCount).toBe(5);
  });

  it('toPersistence should return the raw options object', () => {
    const testJobIdForPersistence = randomUUID();
    const rawOpts = {
      attempts: 5,
      delay: 2000,
      priority: 3,
      jobId: testJobIdForPersistence,
      removeOnComplete: true,
      removeOnFail: { count: 10 },
      timeout: 5000,
      backoff: { type: 'exponential' as const, delay: 1000 },
      maxStalledCount: 2,
    };
    const vo = JobOptionsVO.create(rawOpts);
    expect(vo.toPersistence()).toEqual(rawOpts);
  });
});
