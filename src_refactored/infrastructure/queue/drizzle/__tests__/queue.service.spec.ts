import { randomUUID } from 'node:crypto';

import { vi, describe, it, expect, beforeEach, beforeAll, afterEach } from 'vitest';

// import { IJobRepository } from '@/core/application/ports/job-repository.interface'; // Will use real repository
import { JobEntity, JobStatus } from '../../../../core/domain/job/job.entity';
import { JobIdVO } from '../../../../core/domain/job/value-objects/job-id.vo';
import { type IJobOptions } from '../../../../core/domain/job/value-objects/job-options.vo'; // Use type import
import { DrizzleJobRepository } from '../../../persistence/drizzle/job/drizzle-job.repository'; // Import real repository
import { QueueService } from '../queue.service';

import { TestDb, createTestDbClient, runMigrations, clearDatabaseTables } from './test-db.helper';

// No more mockJobRepository

describe('QueueService (Integration with In-Memory DB)', () => {
  let db: TestDb;
  let jobRepository: DrizzleJobRepository;
  let queueService: QueueService<{ email: string }, { status: string }>;
  const queueName = 'test-email-queue';
  const defaultJobOpts: IJobOptions = { attempts: 1, delay: 0, priority: 0, removeOnComplete: false, removeOnFail: false, maxStalledCount:3 };

  beforeAll(async () => {
    db = createTestDbClient({ memory: true });
    await runMigrations(db);
  });

  beforeEach(async () => {
    vi.clearAllMocks(); // Still useful for vi.spyOn or other Vitest mocks if any remain
    await clearDatabaseTables(db); // Clear tables before each test

    jobRepository = new DrizzleJobRepository(db);
    queueService = new QueueService(queueName, jobRepository, defaultJobOpts);
    vi.spyOn(queueService, 'emit'); // Spy on event emitter
  });

  afterEach(async () => { // Made async
    if (queueService) {
      await queueService.close(); // Stop maintenance loop
    }
    vi.restoreAllMocks(); // Restore any spies
    // Consider if db needs explicit closing if not in-memory for all tests, but helper uses memory for now.
  });

  // afterAll(async () => {
  //   // if db is not :memory:, close it
  // });

  describe('add', () => {
    it('should create a job, save it to DB, and emit job.added event', async () => {
      const jobData = { email: 'test@example.com' };
      const jobName = 'send-welcome-email';

      const createdJob = await queueService.add(jobName, jobData);

      expect(createdJob).toBeInstanceOf(JobEntity);
      expect(createdJob.name).toBe(jobName);
      expect(createdJob.payload).toEqual(jobData);
      expect(createdJob.queueName).toBe(queueName);
      expect(createdJob.options.attempts).toBe(defaultJobOpts.attempts);
      expect(queueService.emit).toHaveBeenCalledWith('job.added', createdJob);

      // Verify job is in the database
      const jobFromDb = await jobRepository.findById(createdJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.id.value).toBe(createdJob.id.value);
      expect(jobFromDb!.name).toBe(jobName);
      expect(jobFromDb!.payload).toEqual(jobData);
    });

    it('should apply custom options when adding a job, and save to DB', async () => {
      const jobData = { email: 'custom@example.com' };
      const jobName = 'custom-options-job';
      const validCustomJobId = randomUUID();
      const customOpts: IJobOptions = { attempts: 5, delay: 5000, priority: 1, jobId: validCustomJobId };

      const createdJob = await queueService.add(jobName, jobData, customOpts);

      expect(createdJob.id.value).toBe(validCustomJobId);
      expect(createdJob.options.attempts).toBe(5);
      expect(createdJob.options.delay).toBe(5000);
      expect(createdJob.options.priority).toBe(1); // Corrected: check createdJob
      expect(createdJob.status).toBe(JobStatus.DELAYED); // Corrected: check createdJob

      const jobFromDb = await jobRepository.findById(createdJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.id.value).toBe(validCustomJobId);
      expect(jobFromDb!.options.priority).toBe(1);
    });
  });

  describe('addBulk', () => {
    it('should add multiple jobs to DB, and emit events', async () => {
      const jobsToAdd = [
        { name: 'bulk1', data: { email: 'b1@example.com' } },
        { name: 'bulk2', data: { email: 'b2@example.com' }, opts: { priority: 1 } },
      ];

      const addedJobs = await queueService.addBulk(jobsToAdd);

      expect(addedJobs.length).toBe(2);
      expect(queueService.emit).toHaveBeenCalledTimes(2);

      const job1FromDb = await jobRepository.findById(addedJobs[0].id);
      expect(job1FromDb).not.toBeNull();
      expect(job1FromDb!.name).toBe('bulk1');
      expect(job1FromDb!.payload).toEqual({ email: 'b1@example.com' });
      expect(queueService.emit).toHaveBeenCalledWith('job.added', addedJobs[0]);

      const job2FromDb = await jobRepository.findById(addedJobs[1].id);
      expect(job2FromDb).not.toBeNull();
      expect(job2FromDb!.name).toBe('bulk2');
      expect(job2FromDb!.options.priority).toBe(1);
      expect(queueService.emit).toHaveBeenCalledWith('job.added', addedJobs[1]);
    });
  });

  describe('getJob', () => {
    it('should retrieve a job from DB by JobIdVO', async () => {
      const jobData = { email: 'find@me.com' };
      const jobName = 'find-me';
      const addedJob = await queueService.add(jobName, jobData); // Add job first

      const foundJob = await queueService.getJob(addedJob.id);

      expect(foundJob).not.toBeNull();
      expect(foundJob!.id.value).toBe(addedJob.id.value);
      expect(foundJob!.name).toBe(jobName);
    });

    it('should retrieve a job from DB by string ID', async () => {
      const jobData = { email: 'find@me-str.com' };
      const jobName = 'find-me-str';
      const addedJob = await queueService.add(jobName, jobData);

      const foundJob = await queueService.getJob(addedJob.id.value);

      expect(foundJob).not.toBeNull();
      expect(foundJob!.id.value).toBe(addedJob.id.value);
    });
  });

  describe('fetchNextJobAndLock', () => {
    const workerId = 'worker-007';
    const lockDurationMs = 30000;

    it('should return null if no jobs are available in DB', async () => {
      const job = await queueService.fetchNextJobAndLock(workerId, lockDurationMs);
      expect(job).toBeNull();
    });

    it('should return null if lock cannot be acquired (e.g. another worker got it - harder to test without true concurrency)', async () => {
      // This scenario is tricky to perfectly simulate without actual concurrent workers.
      // We can simulate it by making acquireLock in the repo return false.
      // For now, we'll assume if a job is found, lock acquisition works or it's handled by repo.
      // A more direct test would be: add job, fetch it (it's locked), try to fetch again (should be null or different job).

      const addedJob = await queueService.add('job1', {email: 'e1@example.com'});

      // Simulate another worker has locked it by directly updating the DB record (or mock acquireLock to fail once)
      // For simplicity with current helper, we'll test the path where a job is found but not lockable.
      // This requires a way to make `acquireLock` return false for a specific job.
      // The current DrizzleJobRepository.acquireLock is an UPDATE query, so it's hard to mock its internal logic of success/failure.
      // We will rely on the fact that if no suitable job (WAITING/DELAYED and not locked or lock expired) is found, it returns null.
      // Or, if a job is found, but `acquireLock` fails (e.g. race condition), `fetchNextJobAndLock` returns null.
      // The current test structure will mostly test the "job found and locked" path.
      // To test "lock failed", we would need to manipulate the job's state in DB to be locked by another worker.

      // Let's test that if a job is already active (locked), it's not fetched again immediately.
      const fetchedAndLockedJob = await queueService.fetchNextJobAndLock(workerId, lockDurationMs);
      expect(fetchedAndLockedJob).not.toBeNull(); // It got the job 'job1'

      const anotherAttempt = await queueService.fetchNextJobAndLock('worker-008', lockDurationMs);
      expect(anotherAttempt).toBeNull(); // job1 is already locked by worker-007
    });

    it('should fetch, lock, update job to active in DB, and emit event', async () => {
      const addedJob = await queueService.add('job2', {email: 'e2@example.com'});

      const fetchedJob = await queueService.fetchNextJobAndLock(workerId, lockDurationMs);

      expect(fetchedJob).not.toBeNull();
      expect(fetchedJob!.id.value).toBe(addedJob.id.value);
      expect(fetchedJob!.status).toBe(JobStatus.ACTIVE);
      expect(fetchedJob!.workerId).toBe(workerId);
      expect(fetchedJob!.lockUntil).toBeInstanceOf(Date);
      expect(fetchedJob!.lockUntil!.getTime()).toBeGreaterThan(Date.now());
      expect(fetchedJob!.processedOn).toBeInstanceOf(Date);
      expect(fetchedJob!.attemptsMade).toBe(1);
      expect(queueService.emit).toHaveBeenCalledWith('job.active', fetchedJob);

      // Verify in DB
      const jobFromDb = await jobRepository.findById(addedJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.ACTIVE);
      expect(jobFromDb!.workerId).toBe(workerId);
    });
  });

  describe('extendJobLock', () => {
    let jobId: JobIdVO;
    const workerId = 'worker-extend';
    const lockDurationMs = 15000;

    beforeEach(async () => {
      jobId = JobIdVO.create();
      const jobOptions: IJobOptions = { jobId: jobId.value };
      await queueService.add('extend-me', { email: 'extend@example.com' }, jobOptions);
      const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000); // Short initial lock
      expect(activeJob).not.toBeNull();
      expect(activeJob!.id.value).toBe(jobId.value);
    });

    it('should extend lock for an active job owned by the worker', async () => {
      const jobBeforeExtend = await jobRepository.findById(jobId);
      expect(jobBeforeExtend).not.toBeNull();
      const originalLockUntil = jobBeforeExtend!.lockUntil;

      await queueService.extendJobLock(jobId, workerId, lockDurationMs);

      const jobAfterExtend = await jobRepository.findById(jobId);
      expect(jobAfterExtend).not.toBeNull();
      expect(jobAfterExtend!.lockUntil!.getTime()).toBeGreaterThan(originalLockUntil!.getTime());
      expect(jobAfterExtend!.lockUntil!.getTime()).toBeGreaterThanOrEqual(Date.now() + lockDurationMs - 2000); // Approx, allow for test execution time
      expect(queueService.emit).toHaveBeenCalledWith('job.lock.extended', expect.objectContaining({ id: jobId }));
    });

    it('should accept string job ID for extendJobLock', async () => {
      await queueService.extendJobLock(jobId.value, workerId, lockDurationMs);
      const jobAfterExtend = await jobRepository.findById(jobId);
      expect(jobAfterExtend).not.toBeNull();
      expect(jobAfterExtend!.lockUntil!.getTime()).toBeGreaterThanOrEqual(Date.now() + lockDurationMs - 2000);
    });

    it('should not extend lock if job not found', async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.extendJobLock(nonExistentJobId, workerId, lockDurationMs);
      // No error should be thrown, but no update should occur, and no emit
      expect(queueService.emit).not.toHaveBeenCalledWith('job.lock.extended', expect.anything());
    });

    it('should not extend lock if workerId does not match', async () => {
      const jobBeforeExtend = await jobRepository.findById(jobId);
      await queueService.extendJobLock(jobId, 'other-worker', lockDurationMs);
      const jobAfterExtend = await jobRepository.findById(jobId);
      expect(jobAfterExtend!.lockUntil!.getTime()).toEqual(jobBeforeExtend!.lockUntil!.getTime()); // Lock time should not change
    });

    it('should not extend lock if job is not active', async () => {
      // Mark job as completed first
      await queueService.markJobAsCompleted(jobId, workerId, { status: 'done' });
      const jobCompleted = await jobRepository.findById(jobId);
      const lockTimeBefore = jobCompleted!.lockUntil; // lockUntil might be null or old

      await queueService.extendJobLock(jobId, workerId, lockDurationMs);
      const jobAfterAttemptedExtend = await jobRepository.findById(jobId);
      // Depending on how markAsCompleted clears lockUntil, it might be null or unchanged.
      // The key is that it wasn't extended to a future time.
      if (lockTimeBefore) {
        expect(jobAfterAttemptedExtend!.lockUntil!.getTime()).toEqual(lockTimeBefore.getTime());
      } else {
        expect(jobAfterAttemptedExtend!.lockUntil).toBeNull();
      }
    });
  });

  describe('markJobAsCompleted', () => {
    let jobIdForCompleteTest: JobIdVO;
    const workerIdForCompleteTest = 'worker-complete';
    const resultForCompleteTest = { status: 'Email Sent!' };

    beforeEach(async () => {
      jobIdForCompleteTest = JobIdVO.create();
      await queueService.add('complete-me', { email: 'c@ex.com' }, { jobId: jobIdForCompleteTest.value });
      const activeJob = await queueService.fetchNextJobAndLock(workerIdForCompleteTest, 10000);
      if (!activeJob || activeJob.id.value !== jobIdForCompleteTest.value) throw new Error('Setup failed for markJobAsCompleted');
    });

    it('should mark job as completed, update DB, and emit event', async () => {
      // Simulate worker adding a log to the job instance it holds
      const jobInstanceFromWorker = await jobRepository.findById(jobIdForCompleteTest);
      jobInstanceFromWorker!.addLog('Log from worker before completion', 'INFO');

      await queueService.markJobAsCompleted(jobIdForCompleteTest, workerIdForCompleteTest, resultForCompleteTest, jobInstanceFromWorker!);

      const jobFromDb = await jobRepository.findById(jobIdForCompleteTest);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
      expect(jobFromDb!.returnValue).toEqual(resultForCompleteTest);
      expect(jobFromDb!.finishedOn).toBeInstanceOf(Date);
      // Check if the log from the worker's instance was persisted
      // This depends on QueueService using jobInstanceWithChanges to update logs/progress
      // The current implementation of QueueService.markJobAsCompleted does NOT use jobInstanceWithChanges for logs/progress.
      // It only uses it for the result. Logs/progress are expected to be saved via updateJobProgress/addJobLog.
      // Therefore, we will not expect the 'Log from worker before completion' here with current service impl.
      // If QueueService were to merge logs from jobInstanceWithChanges, this assertion would change.
      // For now, we test that logs are NOT merged from this parameter.
      expect(jobFromDb!.logs.some(log => log.message === 'Log from worker before completion')).toBe(false);


      expect(queueService.emit).toHaveBeenCalledWith('job.completed', expect.objectContaining({ id: jobIdForCompleteTest, status: JobStatus.COMPLETED }));
    });

    it('should accept string job ID for markJobAsCompleted', async () => {
      await queueService.markJobAsCompleted(jobIdForCompleteTest.value, workerIdForCompleteTest, resultForCompleteTest);
      const jobFromDb = await jobRepository.findById(jobIdForCompleteTest);
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
    });

    it('should not complete if job not found in DB', async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.markJobAsCompleted(nonExistentJobId, workerIdForCompleteTest, resultForCompleteTest);
      // No error, but no emit for completed
      expect(queueService.emit).not.toHaveBeenCalledWith('job.completed', expect.objectContaining({ id: nonExistentJobId }));
    });

    it('should not complete if workerId does not match job in DB', async () => {
      await queueService.markJobAsCompleted(jobIdForCompleteTest, 'another-worker', resultForCompleteTest);
      const jobFromDb = await jobRepository.findById(jobIdForCompleteTest);
      expect(jobFromDb!.status).toBe(JobStatus.ACTIVE); // Should remain active
      expect(queueService.emit).not.toHaveBeenCalledWith('job.completed', expect.anything());
    });
  });

  describe('markJobAsFailed', () => {
    let jobToFailPermanentlyId: JobIdVO;
    let jobToRetryId: JobIdVO;
    const workerIdForFailTest = 'worker-fail';
    const errorForFailTest = new Error('Test Job Failed');

    beforeEach(async () => {
      // Job that should fail permanently
      jobToFailPermanentlyId = JobIdVO.create();
      await queueService.add('fail-me-permanently', { email: 'f-perm@ex.com' }, { jobId: jobToFailPermanentlyId.value, attempts: 1 });
      const activeJobPerm = await queueService.fetchNextJobAndLock(workerIdForFailTest, 10000);
      if (!activeJobPerm || activeJobPerm.id.value !== jobToFailPermanentlyId.value) throw new Error("Setup failed for jobToFailPermanently");

      // Job that should be retried
      jobToRetryId = JobIdVO.create();
      await queueService.add('fail-me-with-retries', { email: 'f-retry@ex.com' }, { jobId: jobToRetryId.value, attempts: 3, backoff: { type: 'exponential', delay: 100 } });
      const activeJobRetry = await queueService.fetchNextJobAndLock(workerIdForFailTest, 10000);
      if (!activeJobRetry || activeJobRetry.id.value !== jobToRetryId.value) throw new Error("Setup failed for jobToRetry");
    });

    it('should mark job as FAILED if attempts exhausted, update DB, and emit event', async () => {
      // jobToFailPermanentlyId is already active and attemptsMade is 1
      await queueService.markJobAsFailed(jobToFailPermanentlyId, workerIdForFailTest, errorForFailTest);

      const jobFromDb = await jobRepository.findById(jobToFailPermanentlyId);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.FAILED);
      expect(jobFromDb!.failedReason).toBe(errorForFailTest.message);
      expect(jobFromDb!.finishedOn).toBeInstanceOf(Date);
      expect(queueService.emit).toHaveBeenCalledWith('job.failed', expect.objectContaining({ id: jobToFailPermanentlyId, status: JobStatus.FAILED }));
    });

    it('should mark job as DELAYED if retries are pending, update DB, and emit event', async () => {
      // jobToRetryId is active, attemptsMade is 1, max attempts is 3
      await queueService.markJobAsFailed(jobToRetryId, workerIdForFailTest, errorForFailTest);

      const jobFromDb = await jobRepository.findById(jobToRetryId);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.DELAYED);
      expect(jobFromDb!.failedReason).toBe(errorForFailTest.message); // Previous error stored
      expect(jobFromDb!.delayUntil).toBeInstanceOf(Date);
      // attemptsMade was 1. Backoff is 100 * 2^(1-1) = 100ms
      expect(jobFromDb!.delayUntil!.getTime()).toBeGreaterThanOrEqual(Date.now() + 90); // Approx 100ms
      expect(jobFromDb!.attemptsMade).toBe(1); // Remains 1, as this is the first failure processing
      expect(queueService.emit).toHaveBeenCalledWith('job.failed', expect.objectContaining({ id: jobToRetryId, status: JobStatus.DELAYED }));
    });

    it('should accept string job ID for markJobAsFailed', async () => {
      await queueService.markJobAsFailed(jobToFailPermanentlyId.value, workerIdForFailTest, errorForFailTest);
      const jobFromDb = await jobRepository.findById(jobToFailPermanentlyId);
      expect(jobFromDb!.status).toBe(JobStatus.FAILED);
    });
  });

  describe('updateJobProgress', () => {
    let jobId: JobIdVO;
    const workerId = 'worker-progress';

    beforeEach(async () => {
      jobId = JobIdVO.create();
      await queueService.add('progress-me', { email: 'progress@example.com' }, { jobId: jobId.value });
      const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000);
      if (!activeJob || activeJob.id.value !== jobId.value) throw new Error("Setup failed for updateJobProgress");
    });

    it('should update progress in DB, and emit event', async () => {
      await queueService.updateJobProgress(jobId, workerId, 50);
      let jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.progress).toBe(50);
      expect(queueService.emit).toHaveBeenCalledWith('job.progress', expect.objectContaining({ id: jobId, progress: 50 }));

      await queueService.updateJobProgress(jobId, workerId, { stage: 'processing' });
      jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.progress).toEqual({ stage: 'processing' });
      expect(queueService.emit).toHaveBeenCalledWith('job.progress', expect.objectContaining({ id: jobId, progress: { stage: 'processing' } }));
    });

    it('should not update progress if job not found or worker mismatch', async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.updateJobProgress(nonExistentJobId, workerId, 75);
      // No error, no emit

      await queueService.updateJobProgress(jobId, 'other-worker', 75);
      const jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.progress).not.toBe(75); // Should still be the initial progress or null
    });
  });

  describe('addJobLog', () => {
    let jobId: JobIdVO;
    const workerId = 'worker-log';

    beforeEach(async () => {
      jobId = JobIdVO.create();
      await queueService.add('log-me', { email: 'log@example.com' }, { jobId: jobId.value });
      const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000);
      if (!activeJob || activeJob.id.value !== jobId.value) throw new Error("Setup failed for addJobLog");
    });

    it('should add log to DB, and emit event', async () => {
      const message = 'Test log message';
      const level = 'DEBUG';
      await queueService.addJobLog(jobId, workerId, message, level);

      const jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.logs.length).toBe(1);
      expect(jobFromDb!.logs[0].message).toBe(message);
      expect(jobFromDb!.logs[0].level).toBe(level);
      expect(jobFromDb!.logs[0].timestamp).toBeInstanceOf(Date);
      expect(queueService.emit).toHaveBeenCalledWith('job.log', expect.objectContaining({ id: jobId }));
    });

     it('should not add log if job not found or worker mismatch', async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.addJobLog(nonExistentJobId, workerId, "test", "INFO");
      // No error, no emit

      await queueService.addJobLog(jobId, 'other-worker', "test", "INFO");
      const jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.logs.length).toBe(0); // Should have no logs from this attempt
    });
  });

  describe('startMaintenance (Stalled Jobs)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(async () => { // Ensure maintenance is stopped and timers are real
      await queueService.stopMaintenance();
      await vi.runAllTimersAsync(); // Clear any pending timers from maintenance
      vi.useRealTimers();
    });

    it('should periodically check for stalled jobs in DB and handle them', async () => {
      const stalledJob1Id = JobIdVO.create();
      let job1 = JobEntity.create({
        // id: stalledJob1Id, // JobEntity.create will use jobId from options or generate one. Let's provide it in options.
        queueName, name: 'stalled1', payload: { email: 's1@ex.com' },
        options: { attempts: 1, jobId: stalledJob1Id.value }
      });
      // Manually set properties to simulate a stalled job already in the DB
      job1.props.status = JobStatus.ACTIVE;
      job1.props.workerId = 'stalled-worker';
      job1.props.lockUntil = new Date(Date.now() - 100000); // Expired lock
      job1.props.processedOn = new Date(Date.now() - 100001);
      job1.props.attemptsMade = 1; // This means next stall will exceed max attempts
      await jobRepository.save(job1);


      const stalledJob2Id = JobIdVO.create();
      let job2 = JobEntity.create({
        queueName, name: 'stalled2', payload: { email: 's2@ex.com' },
        options: { attempts: 2, jobId: stalledJob2Id.value }
      });
      // Manually set properties
      job2.props.status = JobStatus.ACTIVE;
      job2.props.workerId = 'stalled-worker-2';
      job2.props.lockUntil = new Date(Date.now() - 100000); // Expired lock
      job2.props.processedOn = new Date(Date.now() - 100001);
      job2.props.attemptsMade = 1; // Has one more attempt
      await jobRepository.save(job2);

      queueService.startMaintenance();

      // Allow the first maintenance run
      await vi.advanceTimersByTimeAsync(1); // Start the loop
      await vi.advanceTimersByTimeAsync(queueService['maintenanceIntervalMs']); // Wait for one interval

      const job1AfterStall = await jobRepository.findById(stalledJob1Id);
      expect(job1AfterStall!.status).toBe(JobStatus.FAILED); // Max attempts reached
      expect(job1AfterStall!.failedReason).toContain('Stalled');

      const job2AfterStall = await jobRepository.findById(stalledJob2Id);
      expect(job2AfterStall!.status).toBe(JobStatus.WAITING); // Re-queued
      expect(job2AfterStall!.stalledCount).toBe(1);
      expect(job2AfterStall!.workerId).toBeNull(); // WorkerId should be cleared

      // Check that findStalledJobs was called (indirectly, by checking effects)
      // Spy on findStalledJobs if more direct assertion is needed, but effects are good.

      // Allow the second maintenance run - no more stalled jobs expected
      const findStalledJobsSpy = vi.spyOn(jobRepository, 'findStalledJobs');
      await vi.advanceTimersByTimeAsync(queueService['maintenanceIntervalMs'] + 1);
      expect(findStalledJobsSpy).toHaveBeenCalledTimes(1); // Called in this interval
      // Add more assertions if other jobs were expected to be found and processed

      await queueService.stopMaintenance();
      await vi.runAllTimersAsync(); // Ensure loop finishes
      findStalledJobsSpy.mockRestore();
    });
  });

  describe('pause', () => {
    it('should emit queue.paused event', async () => {
      await queueService.pause();
      expect(queueService.emit).toHaveBeenCalledWith('queue.paused');
      // Note: Pause/resume are just event emitters in this impl, no DB state change.
    });
  });

  describe('resume', () => {
    it('should emit queue.resumed event', async () => {
      await queueService.resume();
      expect(queueService.emit).toHaveBeenCalledWith('queue.resumed');
    });
  });

  describe('clean', () => {
    it('should call jobRepository.clean and return the count', async () => {
      const gracePeriodMs = 60000;
      const limit = 10;
      const status = JobStatus.COMPLETED;

      // Create some completed jobs to clean
      await queueService.add('c1', {email: 'c1@c.c'}, {jobId: JobIdVO.create().value});
      const j1 = await queueService.fetchNextJobAndLock('w',1);
      await queueService.markJobAsCompleted(j1!.id, 'w', {status: 'ok'});
      // To make it eligible for cleaning, manually set finishedOn to be old enough
      const job1Entity = await jobRepository.findById(j1!.id);
      job1Entity!.props.finishedOn = new Date(Date.now() - gracePeriodMs * 2);
      await jobRepository.update(job1Entity!);


      const cleanedCount = await queueService.clean(gracePeriodMs, limit, status);
      expect(cleanedCount).toBe(1); // Expecting one job to be cleaned

      const jobAfterClean = await jobRepository.findById(j1!.id);
      expect(jobAfterClean).toBeNull(); // Should be deleted
    });
  });

  describe('countJobsByStatus', () => {
    it('should call jobRepository.countJobsByStatus and return the counts', async () => {
      await queueService.add('w1', {email:'w1@w.c'});
      await queueService.add('w2', {email:'w2@w.c'});
      const jf = await queueService.add('f1', {email:'f1@f.c'}, {attempts:1});
      const activeJf = await queueService.fetchNextJobAndLock('w',1);
      await queueService.markJobAsFailed(activeJf!.id, 'w', new Error('fail'));


      const statuses = [JobStatus.WAITING, JobStatus.FAILED];
      const counts = await queueService.countJobsByStatus(statuses);

      expect(counts[JobStatus.WAITING]).toBe(2);
      expect(counts[JobStatus.FAILED]).toBe(1);
    });
  });

  describe('getJobsByStatus', () => {
    it('should call jobRepository.getJobsByStatus and return mapped jobs', async () => {
      const jc1 = await queueService.add('jc1', {email:'jc1@c.c'});
      const active_jc1 = await queueService.fetchNextJobAndLock('w',1);
      await queueService.markJobAsCompleted(active_jc1!.id, 'w', {status:'ok'});

      const jc2 = await queueService.add('jc2', {email:'jc2@c.c'});
      const active_jc2 = await queueService.fetchNextJobAndLock('w',1);
      await queueService.markJobAsCompleted(active_jc2!.id, 'w', {status:'ok'});


      const statuses = [JobStatus.COMPLETED];
      const result = await queueService.getJobsByStatus(statuses, 0, 10, true);

      expect(result.length).toBe(2);
      expect(result[0].id.value).toBe(jc1.id.value);
      expect(result[1].id.value).toBe(jc2.id.value);
      expect(result[0].status).toBe(JobStatus.COMPLETED);
    });
  });
});
