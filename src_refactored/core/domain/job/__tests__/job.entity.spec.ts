import { JobEntity, JobStatus } from '../job.entity';
import { JobIdVO } from '../value-objects/job-id.vo';
import { JobOptionsVO, IJobBackoffOptions } from '../value-objects/job-options.vo'; // Removed BackoffType, added IJobBackoffOptions for clarity
import { randomUUID } from 'node:crypto';

describe('JobEntity', () => {
  const 기본JobData = {
    queueName: 'test-queue',
    name: 'test-job',
    payload: { data: 'sample' },
  };

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
      backoff: { type: 'exponential', delay: 500 }, // Use string literal
      jobId: testJobId, // Use generated UUID
      removeOnComplete: true,
      removeOnFail: 5,
      timeout: 30000,
    };
    const job = JobEntity.create({ ...기본JobData, options: customOptions });

    expect(job.id.value).toBe(testJobId);
    expect(job.options.attempts).toBe(5);
    expect(job.options.delay).toBe(1000); // This delay is for initial scheduling
    expect(job.options.priority).toBe(10);
    expect(job.options.backoff).toEqual({ type: 'exponential', delay: 500 }); // Use string literal
    expect(job.options.removeOnComplete).toBe(true);
    expect(job.options.removeOnFail).toBe(5);
    expect(job.options.timeout).toBe(30000);
    expect(job.status).toBe(JobStatus.DELAYED); // Because delay > 0
    expect(job.delayUntil).toBeInstanceOf(Date);
    expect(job.delayUntil!.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + 999); // approx
  });

  it('should correctly identify if it is a retry of a job', () => {
    const job = JobEntity.create(기본JobData); // attemptsMade = 0
    expect(job.isRetry).toBe(false); // Initially not a retry

    job.moveToActive('worker-1', new Date(Date.now() + 10000)); // attemptsMade becomes 1
    expect(job.isRetry).toBe(false); // First active attempt is not a retry

    job.moveToDelayed(new Date(Date.now() + 5000), new Error("test error")); // status=DELAYED, failedReason set, attemptsMade=1
    expect(job.isRetry).toBe(true); // Now it's considered pending a retry

    // Simulate it being picked up again
    job.moveToActive('worker-1', new Date(Date.now() + 10000)); // attemptsMade becomes 2
    expect(job.isRetry).toBe(true); // Second active attempt is a retry
  });

  describe('State Transitions', () => {
    let job: JobEntity<{ data: string }, { result: string }>;

    beforeEach(() => {
      job = JobEntity.create(기본JobData);
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
      expect(job.lockUntil).toBeUndefined(); // Lock should be released
      expect(job.workerId).toBeUndefined(); // WorkerId should be cleared
      expect(job.updatedAt.getTime()).toBeGreaterThanOrEqual(job.processedOn!.getTime());
    });

    it('should transition to FAILED if attempts exhausted', () => {
      // Create job with specific options for this test
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
      // Create job with specific options for this test
      const jobWithRetries = JobEntity.create({
        ...기본JobData,
        options: { attempts: 3, backoff: { type: 'fixed', delay: 1000 } }
      });
      jobWithRetries.moveToActive('worker-123', new Date(Date.now() + 10000)); // attemptsMade becomes 1
      const error = new Error('Transient error');
      // The moveToDelayed is typically called by QueueService after calculating backoff.
      // JobEntity itself doesn't have moveToDelayed calculate backoff, it just sets the state.
      // The error from the current attempt is passed to moveToDelayed.
      const backoffDelay = 1000; // As per 'fixed' backoff
      jobWithRetries.moveToDelayed(new Date(Date.now() + backoffDelay), error);


      expect(jobWithRetries.status).toBe(JobStatus.DELAYED);
      expect(jobWithRetries.failedReason).toBe('Transient error');
      expect(jobWithRetries.delayUntil).toBeInstanceOf(Date);
      expect(jobWithRetries.delayUntil!.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + (backoffDelay -1)); // approx
      expect(jobWithRetries.lockUntil).toBeUndefined();
      expect(jobWithRetries.workerId).toBeUndefined();
      expect(jobWithRetries.attemptsMade).toBe(1); // Remains 1, as this is the state *after* the first processing attempt failed
    });

    it('moveToDelayed should correctly set delayUntil and failedReason', async () => { // Added async
      const error = new Error('Specific error for delay');
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now

      // Ensure time advances if using fake timers to make updatedAt different from createdAt
      await vi.advanceTimersByTimeAsync(10);

      job.moveToDelayed(futureDate, error);

      expect(job.status).toBe(JobStatus.DELAYED);
      expect(job.delayUntil).toEqual(futureDate);
      expect(job.failedReason).toBe(error.message);
      expect(job.updatedAt.getTime()).not.toEqual(job.createdAt.getTime()); // Compare getTime() for reliability
    });


    it('should transition to FAILED (via markAsStalled) if attempts exhausted', () => {
      // maxAttempts is job.options.attempts
      const jobStallFail = JobEntity.create({ ...기본JobData, options: { attempts: 1 } });
      jobStallFail.moveToActive('w1', new Date(Date.now() + 100)); // attemptsMade becomes 1. maxAttempts is 1.

      // Simulate stall
      const shouldFailPermanently = jobStallFail.markAsStalled();
      // markAsStalled itself will set to FAILED if attemptsMade >= maxAttempts

      expect(shouldFailPermanently).toBe(true);
      expect(jobStallFail.status).toBe(JobStatus.FAILED); // markAsStalled should set this
      expect(jobStallFail.failedReason).toContain('Job failed after becoming stalled');
      expect(jobStallFail.lockUntil).toBeUndefined();
      expect(jobStallFail.workerId).toBeUndefined();
    });

    it('should return false from markAsStalled if retries are pending, for QueueService to move to WAITING/DELAYED', () => {
      const jobStallWait = JobEntity.create({ ...기본JobData, options: { attempts: 2 } }); // maxAttempts is 2
      jobStallWait.moveToActive('w1', new Date(Date.now() + 100)); // attemptsMade becomes 1

      const shouldFailPermanently = jobStallWait.markAsStalled();
      expect(shouldFailPermanently).toBe(false); // attemptsMade (1) < maxAttempts (2)
      // JobEntity.markAsStalled does not change status to WAITING itself if shouldFailPermanently is false.
      // It only clears lock/worker and expects QueueService to decide the next state.
      // So, status would remain what it was before stall (e.g. ACTIVE, though lock is gone).
      // The test for QueueService's stalled job handling will verify the transition to WAITING/DELAYED.
      // For JobEntity test, we verify the output of markAsStalled and that essential fields are cleared.
      expect(jobStallWait.status).toBe(JobStatus.ACTIVE); // Status is not changed by markAsStalled if not failing permanently
      expect(jobStallWait.lockUntil).toBeUndefined();
      expect(jobStallWait.workerId).toBeUndefined();
    });
  });

  describe('Progress and Logs', () => {
    let job: JobEntity<any, any>;

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

  describe('Lock Management', () => {
    let job: JobEntity<any, any>;

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

  describe('Serialization (toPersistence)', () => {
    it('should correctly serialize to persistence object', () => {
      const testPersistId = randomUUID();
      const customOptions: JobOptionsVO = JobOptionsVO.create({
        attempts: 3,
        delay: 5000, // results in DELAYED status
        priority: 1,
        backoff: { type: 'exponential', delay: 1000 }, // Use string literal
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
        options: customOptions.toPersistence(), // pass raw object
      });

      // Simulate some state changes
      const lockUntil = new Date(Date.now() + 10000);
      job.moveToActive('worker-p', lockUntil);
      job.updateProgress(50);
      job.addLog('Persistence log 1');

      const persistenceObject = job.toPersistence();

      expect(persistenceObject.id).toBe(testPersistId);
      expect(persistenceObject.queueName).toBe('persist-queue');
      expect(persistenceObject.name).toBe('persist-job');
      expect(persistenceObject.payload).toEqual({ msg: 'hello' });

      // Check options - JobOptionsVO should handle its own serialization if needed
      // but here we expect the raw object as it was passed in and stored.
      expect(persistenceObject.options).toEqual(customOptions.toPersistence());

      expect(persistenceObject.status).toBe(JobStatus.ACTIVE);
      expect(persistenceObject.attemptsMade).toBe(1);
      expect(persistenceObject.progress).toBe(50);
      expect(persistenceObject.logs.length).toBe(1);
      expect(persistenceObject.logs[0].message).toBe('Persistence log 1');
      expect(persistenceObject.createdAt).toEqual(job.createdAt.getTime());
      expect(persistenceObject.updatedAt).toEqual(job.updatedAt.getTime());
      expect(persistenceObject.processedOn).toEqual(job.processedOn!.getTime());
      expect(persistenceObject.finishedOn).toBeUndefined();
      // delayUntil was for initial scheduling, job is now active
      expect(persistenceObject.delayUntil).toEqual(job.delayUntil!.getTime());
      expect(persistenceObject.lockUntil).toEqual(lockUntil.getTime());
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
      expect(persistenceObject.finishedOn).toEqual(job.finishedOn!.getTime());
      expect(persistenceObject.lockUntil).toBeUndefined();
      expect(persistenceObject.workerId).toBeUndefined();
    });
  });
});

describe('JobOptionsVO', () => {
  it('should create with default values', () => {
    const opts = JobOptionsVO.create({});
    expect(opts.attempts).toBe(1);
    expect(opts.delay).toBe(0);
    expect(opts.priority).toBe(0);
    // JobOptionsVO stores jobId as a string | undefined.
    // If undefined is passed to create, it remains undefined in props.
    // JobEntity is responsible for creating JobIdVO from this string or generating one.
    expect(opts.jobId).toBeUndefined(); // Default jobId is undefined if not provided
    expect(opts.removeOnComplete).toBe(true); // Default changed in VO
    expect(opts.removeOnFail).toBe(false);
    expect(opts.timeout).toBeUndefined();
    expect(opts.backoff).toBeUndefined();
    expect(opts.maxStalledCount).toBe(3); // Default max stalled count
  });

  it('should create with provided values', () => {
    const testJobIdString = randomUUID();
    const backoff = { type: 'exponential', delay: 1000 }; // Use string literal
    const opts = JobOptionsVO.create({
      attempts: 5,
      delay: 2000,
      priority: 3,
      jobId: testJobIdString, // Use UUID string
      removeOnComplete: true,
      removeOnFail: 10,
      timeout: 5000,
      backoff: backoff,
      maxStalledCount: 5,
    });
    expect(opts.attempts).toBe(5);
    expect(opts.delay).toBe(2000);
    expect(opts.priority).toBe(3);
    expect(opts.jobId).toBe(testJobIdString); // Expect the string
    expect(opts.removeOnComplete).toBe(true);
    expect(opts.removeOnFail).toBe(10);
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
      jobId: testJobIdForPersistence, // Use UUID string
      removeOnComplete: true,
      removeOnFail: 10,
      timeout: 5000,
      backoff: { type: 'exponential', delay: 1000 }, // Use string literal
      maxStalledCount: 2,
    };
    const vo = JobOptionsVO.create(rawOpts);
    expect(vo.toPersistence()).toEqual(rawOpts);
  });
});
