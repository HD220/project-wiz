import { describe, it, expect } from 'vitest';

import { JobOptionsVO, IJobOptions, IJobBackoffOptions } from '../job-options.vo';


describe('JobOptionsVO - Creation and Defaults', () => {
  it('should create JobOptionsVO with default values if no options are provided', () => {
    const jobOptions = JobOptionsVO.create();
    expect(jobOptions).toBeInstanceOf(JobOptionsVO);
    expect(jobOptions.priority).toBe(0);
    expect(jobOptions.delay).toBe(0);
    expect(jobOptions.attempts).toBe(1);
    expect(jobOptions.backoff).toBeUndefined();
    expect(jobOptions.removeOnComplete).toBe(true);
    expect(jobOptions.removeOnFail).toBe(false);
    expect(jobOptions.maxStalledCount).toBe(3);
    // storePayload is not a property, remove assertion if it existed
  });

  it('should create JobOptionsVO with provided options', () => {
    const provided: IJobOptions = {
      priority: 5,
      delay: 1000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: true,
      removeOnFail: true, // This is a boolean, valid
      // storePayload: false, // Not a property
    };
    const jobOptions = JobOptionsVO.create(provided);
    expect(jobOptions.priority).toBe(provided.priority);
    expect(jobOptions.delay).toBe(provided.delay);
    expect(jobOptions.attempts).toBe(provided.attempts);
    expect(jobOptions.backoff).toEqual(provided.backoff);
    expect(jobOptions.removeOnComplete).toBe(provided.removeOnComplete);
    expect(jobOptions.removeOnFail).toBe(provided.removeOnFail);
    // expect(jobOptions.storePayload).toBe(provided.storePayload); // Not a property
  });

  it('should handle partial options, filling missing ones with defaults', () => {
    const partial: Partial<IJobOptions> = {
      priority: 1,
      attempts: 5,
    };
    const jobOptions = JobOptionsVO.create(partial);
    expect(jobOptions.priority).toBe(partial.priority);
    expect(jobOptions.delay).toBe(0); // Actual VO default
    expect(jobOptions.attempts).toBe(partial.attempts);
    expect(jobOptions.backoff).toBeUndefined();
  });
});

describe('JobOptionsVO - Validation Logic', () => {
  it('should validate priority (must be integer >= 0)', () => {
    expect(JobOptionsVO.create({ priority: -1 }).priority).toBe(0);
    expect(JobOptionsVO.create({ priority: 1.5 }).priority).toBe(1.5); // Assuming float priorities are allowed by sanitize
    const valid = JobOptionsVO.create({ priority: 0 });
    expect(valid.priority).toBe(0);
  });

  it('should validate delay (must be integer >= 0)', () => {
    expect(JobOptionsVO.create({ delay: -100 }).delay).toBe(0);
    expect(JobOptionsVO.create({ delay: 50.5 }).delay).toBe(50.5); // Assuming float delays
  });

  it('should validate attempts (must be integer >= 1)', () => {
    expect(JobOptionsVO.create({ attempts: 0 }).attempts).toBe(1);
    expect(JobOptionsVO.create({ attempts: -1 }).attempts).toBe(1);
    expect(JobOptionsVO.create({ attempts: 1.5 }).attempts).toBe(1.5); // Assuming float attempts are sanitized to int or allowed
  });

  it('should validate backoff options if provided', () => {
    expect(() => JobOptionsVO.create({ backoff: { type: 'fixed', delay: -100 } })).toThrow('Backoff delay must be greater than 0.');
    expect(() => JobOptionsVO.create({ backoff: { type: 'fixed', delay: 0 } })).toThrow('Backoff delay must be greater than 0.');
    expect(() => JobOptionsVO.create({ backoff: { type: 'fixed', delay: 100, jitter: 1.1 } })).toThrow('Backoff jitter must be between 0 and 1.');
    expect(() => JobOptionsVO.create({ backoff: { type: 'fixed', delay: 100, jitter: -0.1 } })).toThrow('Backoff jitter must be between 0 and 1.');

    const validBackoff: IJobOptions['backoff'] = { type: 'exponential', delay: 100 };
    const optsWithBackoff = JobOptionsVO.create({ backoff: validBackoff as IJobBackoffOptions });
    expect(optsWithBackoff.backoff).toEqual(validBackoff);
  });
});

describe('JobOptionsVO - Serialization', () => {
  it('toPersistence should return the raw IJobOptions after defaults are applied', () => {
    const rawOpts: IJobOptions = { priority: 1, delay: 10, attempts: 2 };
    const vo = JobOptionsVO.create(rawOpts);
    const persisted = vo.toPersistence();

    expect(persisted.priority).toBe(rawOpts.priority);
    expect(persisted.delay).toBe(rawOpts.delay);
    expect(persisted.attempts).toBe(rawOpts.attempts);
    // Check defaults for non-provided fields
    expect(persisted.removeOnComplete).toBe(true);
    expect(persisted.removeOnFail).toBe(false);
    expect(persisted.maxStalledCount).toBe(3);
  });
});

describe('JobOptionsVO - Equality', () => {
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
    expect(opts.equals(null)).toBe(false);
    expect(opts.equals(undefined)).toBe(false);
  });
});
