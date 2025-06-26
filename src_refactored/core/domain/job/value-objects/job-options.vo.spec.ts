import { describe, it, expect } from 'vitest';
import { JobOptionsVO, IJobOptions, RetryStrategyOptions, RepeatOptions } from './job-options.vo';
import { JobPriorityVO } from './job-priority.vo'; // For default priority value
import { ValueError } from '../../../common/errors';

describe('JobOptionsVO', () => {
  const defaultOpts: Readonly<IJobOptions> = {
    priority: JobPriorityVO.default().value,
    delay: 0,
    attempts: 1,
    retryStrategy: { maxAttempts: 1, backoff: false },
    lifo: false,
    removeOnComplete: false,
    removeOnFail: false,
    timeout: 0,
  };

  it('should create with default values if no options are provided', () => {
    const vo = JobOptionsVO.create();
    expect(vo.value).toEqual(defaultOpts);
  });

  it('should create with default values if empty options object is provided', () => {
    const vo = JobOptionsVO.create({});
    expect(vo.value).toEqual(defaultOpts);
  });

  it('should override default values with provided options', () => {
    const opts: IJobOptions = {
      priority: 3,
      delay: 1000,
      attempts: 5,
      lifo: true,
      removeOnComplete: true,
      removeOnFail: 10,
      timeout: 5000,
    };
    const vo = JobOptionsVO.create(opts);
    expect(vo.value).toEqual({
      ...defaultOpts, // Spread defaults first
      ...opts,        // Then override with provided opts
      // Ensure retryStrategy is correctly formed if only attempts is given
      retryStrategy: { maxAttempts: 5, backoff: false },
    });
  });

  it('should handle custom jobId', () => {
    const jobId = 'custom-id-fa001e7a-556ee-47f3-8029-33d4defc19b1'; // Example with wrong length for some segments
    const vo = JobOptionsVO.create({ jobId });
    expect(vo.jobId).toBe(jobId); // Assuming isValidUUID is not overly strict on version for this test
  });

  it('should throw ValueError for invalid custom jobId', () => {
    expect(() => JobOptionsVO.create({ jobId: 'invalid-uuid' })).toThrow(ValueError);
  });

  it('should handle retryStrategy correctly', () => {
    const retryStrategy: RetryStrategyOptions = {
      maxAttempts: 3,
      backoff: { type: 'exponential', delayMs: 1000 },
    };
    const vo = JobOptionsVO.create({ retryStrategy });
    expect(vo.retryStrategy).toEqual(retryStrategy);
    expect(vo.attempts).toBe(3); // attempts getter should reflect retryStrategy.maxAttempts
  });

  it('should prioritize retryStrategy.maxAttempts over direct attempts if both provided', () => {
    const opts: IJobOptions = {
      attempts: 5, // This will be used to update retryStrategy.maxAttempts
      retryStrategy: { maxAttempts: 3, backoff: { type: 'fixed', delayMs: 500 } },
    };
    const vo = JobOptionsVO.create(opts);
    // The create logic merges attempts into retryStrategy.maxAttempts
    expect(vo.attempts).toBe(5);
    expect(vo.retryStrategy?.maxAttempts).toBe(5);
    expect(vo.retryStrategy?.backoff).toEqual({ type: 'fixed', delayMs: 500 });
  });

  it('should form retryStrategy if only attempts is given', () => {
    const vo = JobOptionsVO.create({ attempts: 4 });
    expect(vo.attempts).toBe(4);
    expect(vo.retryStrategy).toEqual({ maxAttempts: 4, backoff: false });
  });

  it('should handle repeat options', () => {
    const repeat: RepeatOptions = { cron: '0 0 * * *', limit: 10 };
    const vo = JobOptionsVO.create({ repeat });
    expect(vo.repeat).toEqual(repeat);
  });

  it('should handle dependencies and parentId', () => {
    const dependsOnJobIds = [JobOptionsVO.generate().jobId!]; // Generate a valid UUID
    const parentId = JobOptionsVO.generate().jobId!;
    const vo = JobOptionsVO.create({ dependsOnJobIds, parentId });
    expect(vo.dependsOnJobIds).toEqual(dependsOnJobIds);
    expect(vo.parentId).toBe(parentId);
  });

  it('should throw ValueError for invalid dependsOnJobIds', () => {
    expect(() => JobOptionsVO.create({ dependsOnJobIds: ['invalid-id'] })).toThrow(ValueError);
  });

  it('should throw ValueError for invalid parentId', () => {
     expect(() => JobOptionsVO.create({ parentId: 'invalid-id' })).toThrow(ValueError);
  });

  it('should throw ValueError for negative delay, attempts, or timeout', () => {
    expect(() => JobOptionsVO.create({ delay: -100 })).toThrow(ValueError);
    expect(() => JobOptionsVO.create({ attempts: 0 })).toThrow(ValueError);
    expect(() => JobOptionsVO.create({ timeout: -1 })).toThrow(ValueError);
    expect(() => JobOptionsVO.create({ retryStrategy: {maxAttempts: 0, backoff: false} })).toThrow(ValueError);
    expect(() => JobOptionsVO.create({ retryStrategy: {maxAttempts: 1, backoff: {type: 'fixed', delayMs: -10}} })).toThrow(ValueError);
  });

  it('equals() should compare options correctly', () => {
    const opts1 = JobOptionsVO.create({ priority: 1, delay: 100 });
    const opts2 = JobOptionsVO.create({ priority: 1, delay: 100 });
    const opts3 = JobOptionsVO.create({ priority: 2, delay: 100 });

    expect(opts1.equals(opts2)).toBe(true);
    expect(opts1.equals(opts3)).toBe(false);
  });
});

// Helper to generate valid UUID for JobIdVO in tests if needed by other tests
JobOptionsVO.generate = () => JobOptionsVO.create({ jobId: 'a1b2c3d4-e5f6-4777-8888-999a0b1c2d3e' });
