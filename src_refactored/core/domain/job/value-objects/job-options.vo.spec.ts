import { describe, it, expect } from 'vitest';

import { JobOptionsVO, IJobOptions, BackoffOptions } from './job-options.vo';

describe('JobOptionsVO', () => {
  const defaultOptions: IJobOptions = {
    priority: 10,
    delay: 0,
    attempts: 1,
    backoff: undefined,
    removeOnComplete: false,
    removeOnFail: false,
    storePayload: true,
  };

  it('should create JobOptionsVO with default values if no options are provided', () => {
    const jobOptions = JobOptionsVO.create();
    expect(jobOptions).toBeInstanceOf(JobOptionsVO);
    expect(jobOptions.priority).toBe(defaultOptions.priority);
    expect(jobOptions.delay).toBe(defaultOptions.delay);
    expect(jobOptions.attempts).toBe(defaultOptions.attempts);
    expect(jobOptions.backoff).toBeUndefined();
    expect(jobOptions.removeOnComplete).toBe(defaultOptions.removeOnComplete);
    expect(jobOptions.removeOnFail).toBe(defaultOptions.removeOnFail);
    expect(jobOptions.storePayload).toBe(defaultOptions.storePayload);
  });

  it('should create JobOptionsVO with provided options', () => {
    const provided: IJobOptions = {
      priority: 5,
      delay: 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: true,
      removeOnFail: true,
      storePayload: false,
    };
    const jobOptions = JobOptionsVO.create(provided);
    expect(jobOptions.priority).toBe(provided.priority);
    expect(jobOptions.delay).toBe(provided.delay);
    expect(jobOptions.attempts).toBe(provided.attempts);
    expect(jobOptions.backoff).toEqual(provided.backoff);
    expect(jobOptions.removeOnComplete).toBe(provided.removeOnComplete);
    expect(jobOptions.removeOnFail).toBe(provided.removeOnFail);
    expect(jobOptions.storePayload).toBe(provided.storePayload);
  });

  it('should handle partial options, filling missing ones with defaults', () => {
    const partial: Partial<IJobOptions> = {
      priority: 1,
      attempts: 5,
    };
    const jobOptions = JobOptionsVO.create(partial);
    expect(jobOptions.priority).toBe(partial.priority);
    expect(jobOptions.delay).toBe(defaultOptions.delay); // Default
    expect(jobOptions.attempts).toBe(partial.attempts);
    expect(jobOptions.backoff).toBeUndefined(); // Default
  });

  it('should validate priority (must be integer >= 0)', () => {
    expect(() => JobOptionsVO.create({ priority: -1 })).toThrow('Priority must be a non-negative integer.');
    expect(() => JobOptionsVO.create({ priority: 1.5 })).toThrow('Priority must be a non-negative integer.');
    const valid = JobOptionsVO.create({ priority: 0 });
    expect(valid.priority).toBe(0);
  });

  it('should validate delay (must be integer >= 0)', () => {
    expect(() => JobOptionsVO.create({ delay: -100 })).toThrow('Delay must be a non-negative integer.');
    expect(() => JobOptionsVO.create({ delay: 50.5 })).toThrow('Delay must be a non-negative integer.');
  });

  it('should validate attempts (must be integer >= 1)', () => {
    expect(() => JobOptionsVO.create({ attempts: 0 })).toThrow('Attempts must be a positive integer.');
    expect(() => JobOptionsVO.create({ attempts: -1 })).toThrow('Attempts must be a positive integer.');
    expect(() => JobOptionsVO.create({ attempts: 1.5 })).toThrow('Attempts must be a positive integer.');
  });

  it('should validate backoff options if provided', () => {
    expect(() => JobOptionsVO.create({ backoff: { type: 'fixed', delay: -100 } })).toThrow('Backoff delay must be a positive integer.');
    expect(() => JobOptionsVO.create({ backoff: { type: 'fixed', delay: 0 } })).toThrow('Backoff delay must be a positive integer.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => JobOptionsVO.create({ backoff: { type: 'invalid' as any, delay: 1000 } })).toThrow('Invalid backoff type: invalid');

    const validBackoff: BackoffOptions = { type: 'exponential', delay: 100 };
    const optsWithBackoff = JobOptionsVO.create({ backoff: validBackoff });
    expect(optsWithBackoff.backoff).toEqual(validBackoff);
  });

  it('toPersistence should return the raw IJobOptions', () => {
    const rawOpts: IJobOptions = { priority: 1, delay: 10, attempts: 2, storePayload: true };
    const vo = JobOptionsVO.create(rawOpts);
    const persisted = vo.toPersistence();
    // Check a few key properties, defaults will fill others
    expect(persisted.priority).toBe(rawOpts.priority);
    expect(persisted.delay).toBe(rawOpts.delay);
    expect(persisted.attempts).toBe(rawOpts.attempts);
    expect(persisted.storePayload).toBe(rawOpts.storePayload);
    // Ensure all defaults are there if not provided in rawOpts
    expect(persisted.removeOnComplete).toBe(defaultOptions.removeOnComplete);
  });

  it('equals should return true for JobOptionsVOs with the same options', () => {
    const opts1 = JobOptionsVO.create({ priority: 1, attempts: 3 });
    const opts2 = JobOptionsVO.create({ priority: 1, attempts: 3 });
    expect(opts1.equals(opts2)).toBe(true);
  });

  it('equals should return false for JobOptionsVOs with different options', () => {
    const opts1 = JobOptionsVO.create({ priority: 1 });
    const opts2 = JobOptionsVO.create({ priority: 2 });
    expect(opts1.equals(opts2)).toBe(false);

    const opts3 = JobOptionsVO.create({ backoff: { type: 'fixed', delay: 100 } });
    const opts4 = JobOptionsVO.create({ backoff: { type: 'exponential', delay: 100 } });
    expect(opts3.equals(opts4)).toBe(false);
  });

  it('equals should return false when compared to null or undefined', () => {
    const opts = JobOptionsVO.create();
    expect(opts.equals(null)).toBe(false); // Removed 'as any'
    expect(opts.equals(undefined)).toBe(false); // Removed 'as any'
  });
});
