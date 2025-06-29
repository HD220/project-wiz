import { QueueService } from '../queue.service';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { IJobOptions, BackoffType } from '@/core/domain/job/value-objects/job-options.vo';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// Mock JobRepository
const mockJobRepository: IJobRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findNextJobsToProcess: vi.fn(),
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
  findStalledJobs: vi.fn(),
  getJobsByStatus: vi.fn(),
  countJobsByStatus: vi.fn(),
  clean: vi.fn(),
};

describe('QueueService', () => {
  let queueService: QueueService<{ email: string }, { status: string }>;
  const queueName = 'test-email-queue';
  const defaultJobOpts: IJobOptions = { attempts: 1, delay: 0, priority: 0, removeOnComplete: false, removeOnFail: false, maxStalledCount:3 };

  beforeEach(() => {
    vi.clearAllMocks();
    queueService = new QueueService(queueName, mockJobRepository, defaultJobOpts);
    // Spy on event emitter
    vi.spyOn(queueService, 'emit');
  });

  describe('add', () => {
    it('should create a job, save it, and emit job.added event', async () => {
      const jobData = { email: 'test@example.com' };
      const jobName = 'send-welcome-email';

      (mockJobRepository.save as Mock).mockImplementation(async (job: JobEntity<any,any>) => job);

      const job = await queueService.add(jobName, jobData);

      expect(job).toBeInstanceOf(JobEntity);
      expect(job.name).toBe(jobName);
      expect(job.payload).toEqual(jobData);
      expect(job.queueName).toBe(queueName);
      expect(job.options.attempts).toBe(defaultJobOpts.attempts);
      expect(mockJobRepository.save).toHaveBeenCalledOnce();
      expect(mockJobRepository.save).toHaveBeenCalledWith(job);
      expect(queueService.emit).toHaveBeenCalledWith('job.added', job);
    });

    it('should apply custom options when adding a job', async () => {
      const jobData = { email: 'custom@example.com' };
      const jobName = 'custom-options-job';
      const customOpts: IJobOptions = { attempts: 5, delay: 5000, priority: 1, jobId: 'custom123' };

      (mockJobRepository.save as Mock).mockImplementation(async (job: JobEntity<any,any>) => job);

      const job = await queueService.add(jobName, jobData, customOpts);

      expect(job.id.value).toBe('custom123');
      expect(job.options.attempts).toBe(5);
      expect(job.options.delay).toBe(5000);
      expect(job.options.priority).toBe(1);
      expect(job.status).toBe(JobStatus.DELAYED); // due to delay
      expect(mockJobRepository.save).toHaveBeenCalledOnce();
    });
  });

  describe('addBulk', () => {
    it('should add multiple jobs, save them, and emit events', async () => {
      const jobsToAdd = [
        { name: 'bulk1', data: { email: 'b1@example.com' } },
        { name: 'bulk2', data: { email: 'b2@example.com' }, opts: { priority: 1 } },
      ];

      (mockJobRepository.save as Mock).mockImplementation(async (job: JobEntity<any,any>) => job);

      const addedJobs = await queueService.addBulk(jobsToAdd);

      expect(addedJobs.length).toBe(2);
      expect(mockJobRepository.save).toHaveBeenCalledTimes(2);
      expect(queueService.emit).toHaveBeenCalledTimes(2);

      expect(addedJobs[0].name).toBe('bulk1');
      expect(addedJobs[0].payload).toEqual({ email: 'b1@example.com' });
      expect(queueService.emit).toHaveBeenCalledWith('job.added', addedJobs[0]);

      expect(addedJobs[1].name).toBe('bulk2');
      expect(addedJobs[1].options.priority).toBe(1);
      expect(queueService.emit).toHaveBeenCalledWith('job.added', addedJobs[1]);
    });
  });

  describe('getJob', () => {
    it('should call repository findById and return a job', async () => {
      const jobId = JobIdVO.create();
      const mockJob = JobEntity.create({ id: jobId, queueName, name: 'find-me', payload: { email: 'find@me.com' } });
      (mockJobRepository.findById as Mock).mockResolvedValue(mockJob);

      const foundJob = await queueService.getJob(jobId);

      expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
      expect(foundJob).toBe(mockJob);
    });
     it('should accept string id for getJob', async () => {
      const jobIdStr = 'string-id-123';
      const mockJob = JobEntity.create({ id: JobIdVO.create(jobIdStr), queueName, name: 'find-me-str', payload: { email: 'find@me.com' } });
      (mockJobRepository.findById as Mock).mockResolvedValue(mockJob);

      const foundJob = await queueService.getJob(jobIdStr);

      expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.any(JobIdVO));
      expect((mockJobRepository.findById as Mock).mock.calls[0][0].value).toBe(jobIdStr);
      expect(foundJob).toBe(mockJob);
    });
  });

  describe('fetchNextJobAndLock', () => {
    const workerId = 'worker-007';
    const lockDurationMs = 30000;

    it('should return null if no jobs are available', async () => {
      (mockJobRepository.findNextJobsToProcess as Mock).mockResolvedValue([]);
      const job = await queueService.fetchNextJobAndLock(workerId, lockDurationMs);
      expect(job).toBeNull();
      expect(mockJobRepository.findNextJobsToProcess).toHaveBeenCalledWith(queueName, 1);
      expect(mockJobRepository.acquireLock).not.toHaveBeenCalled();
    });

    it('should return null if lock cannot be acquired', async () => {
      const availableJob = JobEntity.create({ queueName, name: 'job1', payload: {email: 'e1@example.com'} });
      (mockJobRepository.findNextJobsToProcess as Mock).mockResolvedValue([availableJob]);
      (mockJobRepository.acquireLock as Mock).mockResolvedValue(false); // Lock acquisition fails

      const job = await queueService.fetchNextJobAndLock(workerId, lockDurationMs);

      expect(job).toBeNull();
      expect(mockJobRepository.acquireLock).toHaveBeenCalledWith(
        availableJob.id,
        workerId,
        expect.any(Date) // lockUntil
      );
      expect(mockJobRepository.update).not.toHaveBeenCalled();
      expect(queueService.emit).not.toHaveBeenCalledWith('job.active', expect.anything());
    });

    it('should fetch, lock, update job to active, and emit event', async () => {
      const availableJob = JobEntity.create({ queueName, name: 'job2', payload: {email: 'e2@example.com'} });
      (mockJobRepository.findNextJobsToProcess as Mock).mockResolvedValue([availableJob]);
      (mockJobRepository.acquireLock as Mock).mockResolvedValue(true); // Lock acquisition succeeds
      (mockJobRepository.update as Mock).mockImplementation(async (jobEntity: JobEntity<any,any>) => jobEntity);


      const job = await queueService.fetchNextJobAndLock(workerId, lockDurationMs);

      expect(job).toBe(availableJob);
      expect(job!.status).toBe(JobStatus.ACTIVE);
      expect(job!.workerId).toBe(workerId);
      expect(job!.lockUntil).toBeInstanceOf(Date);
      expect(job!.lockUntil!.getTime()).toBeGreaterThan(Date.now());
      expect(job!.processedOn).toBeInstanceOf(Date);
      expect(job!.attemptsMade).toBe(1);

      expect(mockJobRepository.update).toHaveBeenCalledWith(job);
      expect(queueService.emit).toHaveBeenCalledWith('job.active', job);
    });
  });

  describe('extendJobLock', () => {
    const jobId = JobIdVO.create('lock-job-id');
    const workerId = 'worker-extend';
    const lockDurationMs = 15000;
    let jobToExtend: JobEntity<{data: string}, {res: string}>;

    beforeEach(() => {
        jobToExtend = JobEntity.create({ id: jobId, queueName, name: 'extend-me', payload: {data: 'payload'} });
        jobToExtend.moveToActive(workerId, new Date(Date.now() + 10000)); // Initial lock
        (mockJobRepository.findById as Mock).mockResolvedValue(jobToExtend);
        (mockJobRepository.update as Mock).mockImplementation(async (jobEntity: JobEntity<any,any>) => jobEntity);
    });

    it('should extend lock for an active job owned by the worker', async () => {
        const originalLockUntil = jobToExtend.lockUntil;
        await queueService.extendJobLock(jobId, workerId, lockDurationMs);

        expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobToExtend.lockUntil!.getTime()).toBeGreaterThan(originalLockUntil!.getTime());
        expect(jobToExtend.lockUntil!.getTime()).toBeGreaterThanOrEqual(Date.now() + lockDurationMs - 1000); // Approx
        expect(mockJobRepository.update).toHaveBeenCalledWith(jobToExtend);
        expect(queueService.emit).toHaveBeenCalledWith('job.lock.extended', jobToExtend);
    });

    it('should accept string job ID for extendJobLock', async () => {
        await queueService.extendJobLock(jobId.value, workerId, lockDurationMs);
        expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: jobId.value }));
        expect(mockJobRepository.update).toHaveBeenCalled();
    });

    it('should not extend lock if job not found', async () => {
        (mockJobRepository.findById as Mock).mockResolvedValue(null);
        await queueService.extendJobLock(jobId, workerId, lockDurationMs);
        expect(mockJobRepository.update).not.toHaveBeenCalled();
        expect(queueService.emit).not.toHaveBeenCalledWith('job.lock.extended', expect.anything());
    });

    it('should not extend lock if workerId does not match', async () => {
        await queueService.extendJobLock(jobId, 'other-worker', lockDurationMs);
        expect(mockJobRepository.update).not.toHaveBeenCalled();
    });

    it('should not extend lock if job is not active', async () => {
        jobToExtend.markAsCompleted({res: 'done'});
        await queueService.extendJobLock(jobId, workerId, lockDurationMs);
        expect(mockJobRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('markJobAsCompleted', () => {
    const jobId = JobIdVO.create('complete-job-id');
    const workerId = 'worker-complete';
    const result = { status: 'Email Sent!' };
    let jobToComplete: JobEntity<{email: string}, {status: string}>;

    beforeEach(() => {
        jobToComplete = JobEntity.create({ id: jobId, queueName, name: 'complete-me', payload: {email: 'c@ex.com'} });
        jobToComplete.moveToActive(workerId, new Date(Date.now() + 10000));
        (mockJobRepository.findById as Mock).mockResolvedValue(jobToComplete);
        (mockJobRepository.update as Mock).mockImplementation(async (jobEntity: JobEntity<any,any>) => jobEntity);
    });

    it('should mark job as completed, update, and emit event', async () => {
        // Pass a new instance for jobInstanceWithChanges to simulate worker modifications
        const jobInstanceFromWorker = JobEntity.fromPersistence({ ...jobToComplete.toPersistence(), logs: [...jobToComplete.logs, { message: 'Worker log', level: 'INFO', timestamp: new Date() }] });

        await queueService.markJobAsCompleted(jobId, workerId, result, jobInstanceFromWorker);

        expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobToComplete.status).toBe(JobStatus.COMPLETED);
        expect(jobToComplete.returnValue).toEqual(result);
        expect(jobToComplete.finishedOn).toBeInstanceOf(Date);
        // expect(jobToComplete.logs.some(log => log.message === 'Worker log')).toBe(true); // This needs JobEntity to merge logs, or QueueService to do it.
        // For now, the passed instance is not used to update the one fetched by findById
        // The responsibility for merging logs/progress from jobInstanceWithChanges onto the job fetched from DB (jobToComplete)
        // is not clearly defined in the current QueueService.markJobAsCompleted.
        // It currently uses the job fetched from DB and calls markAsCompleted on it.
        // The example `queue-usage-example.final.ts` shows job.addLog being called on the job instance within the processor,
        // and then that job instance is passed to markJobAsCompleted/Failed.
        // This implies that QueueService *should* use the logs/progress from jobInstanceWithChanges.
        // Let's assume for now the test ensures the *status* and *result* are set on the DB-fetched job.

        expect(mockJobRepository.update).toHaveBeenCalledWith(jobToComplete);
        expect(queueService.emit).toHaveBeenCalledWith('job.completed', jobToComplete);
    });

     it('should accept string job ID for markJobAsCompleted', async () => {
        const jobInstanceFromWorker = JobEntity.fromPersistence(jobToComplete.toPersistence());
        await queueService.markJobAsCompleted(jobId.value, workerId, result, jobInstanceFromWorker);
        expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.objectContaining({value: jobId.value}));
        expect(mockJobRepository.update).toHaveBeenCalled();
    });

    it('should not complete if job not found or workerId mismatch', async () => {
        (mockJobRepository.findById as Mock).mockResolvedValue(null);
        await queueService.markJobAsCompleted(jobId, workerId, result, jobToComplete);
        expect(mockJobRepository.update).not.toHaveBeenCalled();

        const anotherJob = JobEntity.create({id: jobId, queueName, name: 'x', payload:{email:'y@c.o'}});
        anotherJob.moveToActive('another-worker', new Date());
        (mockJobRepository.findById as Mock).mockResolvedValue(anotherJob);
        await queueService.markJobAsCompleted(jobId, workerId, result, anotherJob); // Original workerId, but job is locked by another-worker
        expect(mockJobRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('markJobAsFailed', () => {
    const jobId = JobIdVO.create('fail-job-id');
    const workerId = 'worker-fail';
    const error = new Error('Test Job Failed');
    let jobToFail: JobEntity<{email: string}, {status: string}>;

    beforeEach(() => {
        jobToFail = JobEntity.create({
            id: jobId,
            queueName,
            name: 'fail-me',
            payload: {email: 'f@ex.com'},
            options: { attempts: 3, backoff: { type: BackoffType.EXPONENTIAL, delay: 100 } }
        });
        jobToFail.moveToActive(workerId, new Date(Date.now() + 10000)); // attemptsMade becomes 1
        (mockJobRepository.findById as Mock).mockResolvedValue(jobToFail);
        (mockJobRepository.update as Mock).mockImplementation(async (jobEntity: JobEntity<any,any>) => jobEntity);
    });

    it('should mark job as FAILED if attempts exhausted, update, and emit event', async () => {
        jobToFail.options.attempts = 1; // Ensure it fails on this attempt
        // jobToFail.moveToActive(workerId, new Date()); // already did in beforeEach, attemptsMade is 1

        const jobInstanceFromWorker = JobEntity.fromPersistence(jobToFail.toPersistence());

        await queueService.markJobAsFailed(jobId, workerId, error, jobInstanceFromWorker);

        expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobToFail.status).toBe(JobStatus.FAILED);
        expect(jobToFail.failedReason).toBe(error.message);
        expect(jobToFail.finishedOn).toBeInstanceOf(Date);
        expect(mockJobRepository.update).toHaveBeenCalledWith(jobToFail);
        expect(queueService.emit).toHaveBeenCalledWith('job.failed', jobToFail);
    });

    it('should mark job as DELAYED if retries are pending, update, and emit event', async () => {
        // jobToFail.options.attempts = 3; // Default from its creation
        // jobToFail.moveToActive(workerId, new Date()); // attemptsMade becomes 1 in beforeEach

        const jobInstanceFromWorker = JobEntity.fromPersistence(jobToFail.toPersistence());
        await queueService.markJobAsFailed(jobId, workerId, error, jobInstanceFromWorker);

        expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobToFail.status).toBe(JobStatus.DELAYED);
        expect(jobToFail.failedReason).toBe(error.message); // Previous error
        expect(jobToFail.delayUntil).toBeInstanceOf(Date);
        // attemptsMade was 1 from moveToActive. It's not incremented by markJobAsFailed/moveToDelayed itself.
        // The backoff calculation in QueueService uses job.attemptsMade which is 1. So backoff is 100 * 2^(1-1) = 100ms
        expect(jobToFail.delayUntil!.getTime()).toBeGreaterThanOrEqual(Date.now() + 90); // Approx 100ms
        expect(jobToFail.attemptsMade).toBe(1); // Remains 1, as this is the first failure processing

        expect(mockJobRepository.update).toHaveBeenCalledWith(jobToFail);
        expect(queueService.emit).toHaveBeenCalledWith('job.failed', jobToFail); // Event is still 'job.failed' even if delayed
    });

    it('should accept string job ID for markJobAsFailed', async () => {
        const jobInstanceFromWorker = JobEntity.fromPersistence(jobToFail.toPersistence());
        await queueService.markJobAsFailed(jobId.value, workerId, error, jobInstanceFromWorker);
        expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: jobId.value }));
        expect(mockJobRepository.update).toHaveBeenCalled();
    });
  });

  describe('updateJobProgress', () => {
    const jobId = JobIdVO.create('progress-job-id');
    const workerId = 'worker-progress';
    let jobToUpdate: JobEntity<any,any>;

    beforeEach(() => {
        jobToUpdate = JobEntity.create({id: jobId, queueName, name: 'progress-me', payload: {}});
        jobToUpdate.moveToActive(workerId, new Date(Date.now() + 10000));
        (mockJobRepository.findById as Mock).mockResolvedValue(jobToUpdate);
        (mockJobRepository.update as Mock).mockImplementation(async (jobEntity: JobEntity<any,any>) => jobEntity);
    });

    it('should update progress, save, and emit event', async () => {
        await queueService.updateJobProgress(jobId, workerId, 50);
        expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobToUpdate.progress).toBe(50);
        expect(mockJobRepository.update).toHaveBeenCalledWith(jobToUpdate);
        expect(queueService.emit).toHaveBeenCalledWith('job.progress', jobToUpdate);

        await queueService.updateJobProgress(jobId, workerId, { stage: 'processing' });
        expect(jobToUpdate.progress).toEqual({ stage: 'processing' });
        expect(mockJobRepository.update).toHaveBeenCalledTimes(2);
        expect(queueService.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('addJobLog', () => {
    const jobId = JobIdVO.create('log-job-id');
    const workerId = 'worker-log';
    let jobToLogTo: JobEntity<any,any>;

     beforeEach(() => {
        jobToLogTo = JobEntity.create({id: jobId, queueName, name: 'log-me', payload: {}});
        jobToLogTo.moveToActive(workerId, new Date(Date.now() + 10000));
        (mockJobRepository.findById as Mock).mockResolvedValue(jobToLogTo);
        (mockJobRepository.update as Mock).mockImplementation(async (jobEntity: JobEntity<any,any>) => jobEntity);
    });

    it('should add log, save, and emit event', async () => {
        await queueService.addJobLog(jobId, workerId, 'Test log message', 'DEBUG');
        expect(mockJobRepository.findById).toHaveBeenCalledWith(jobId);
        expect(jobToLogTo.logs.length).toBe(1);
        expect(jobToLogTo.logs[0].message).toBe('Test log message');
        expect(jobToLogTo.logs[0].level).toBe('DEBUG');
        expect(mockJobRepository.update).toHaveBeenCalledWith(jobToLogTo);
        expect(queueService.emit).toHaveBeenCalledWith('job.log', jobToLogTo);
    });
  });

  describe('startMaintenance (Stalled Jobs)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should periodically check for stalled jobs and handle them', async () => {
        const stalledJob1 = JobEntity.create({ queueName, name: 'stalled1', payload: {}, options: {maxStalledCount: 1} });
        stalledJob1.moveToActive('w-stall', new Date(Date.now() - 1000)); // Lock already expired
        stalledJob1.status = JobStatus.ACTIVE; // Simulate it was active

        const stalledJob2 = JobEntity.create({ queueName, name: 'stalled2', payload: {}, options: {maxStalledCount: 2} });
        stalledJob2.moveToActive('w-stall2', new Date(Date.now() - 1000)); // Lock expired
        stalledJob2.status = JobStatus.ACTIVE;


        (mockJobRepository.findStalledJobs as Mock)
            .mockResolvedValueOnce([stalledJob1, stalledJob2]) // First call
            .mockResolvedValueOnce([]); // Subsequent calls find no more

        (mockJobRepository.update as Mock).mockImplementation(async (job: JobEntity<any,any>) => job);

        queueService.startMaintenance();

        // First job (stalledJob1)
        // 1st stall: markAsStalled -> shouldFail=false (maxStalledCount=1, currentStalled=0 -> 1), status -> WAITING
        // (In test, entity's markAsStalled will increment count then check. So it becomes 1, 1 <= 1 is true for shouldFail)
        // Actually, job.entity.markAsStalled() returns true if job.stalledCount >= job.options.maxStalledCount
        // So, if maxStalledCount = 1.
        // 1. moveToActive (stalledCount=0)
        // 2. findStalledJobs finds it. Call job.markAsStalled(). stalledCount becomes 1. 1 >= 1 is true. shouldFail = true.
        // 3. job.markAsFailed()

        // Second job (stalledJob2)
        // 1st stall: markAsStalled -> shouldFail=false (maxStalledCount=2, currentStalled=0 -> 1), status -> WAITING

        await vi.advanceTimersByTimeAsync(15000); // Trigger interval

        expect(mockJobRepository.findStalledJobs).toHaveBeenCalledWith(queueName, expect.any(Date), 10);

        // For stalledJob1 (maxStalledCount = 1)
        expect(stalledJob1.status).toBe(JobStatus.FAILED); // Should be marked FAILED
        expect(stalledJob1.failedReason).toContain('Job failed after becoming stalled');
        expect(stalledJob1.stalledCount).toBe(1);
        expect(queueService.emit).toHaveBeenCalledWith('job.stalled', stalledJob1);
        expect(mockJobRepository.update).toHaveBeenCalledWith(stalledJob1);

        // For stalledJob2 (maxStalledCount = 2)
        expect(stalledJob2.status).toBe(JobStatus.WAITING); // Should be re-queued
        expect(stalledJob2.stalledCount).toBe(1);
        expect(queueService.emit).toHaveBeenCalledWith('job.stalled', stalledJob2);
        expect(mockJobRepository.update).toHaveBeenCalledWith(stalledJob2);


        await vi.advanceTimersByTimeAsync(15000); // Trigger interval again
        expect(mockJobRepository.findStalledJobs).toHaveBeenCalledTimes(2); // Second call returns []

        await queueService.close(); // Clears interval
    });
  });

  // TODO: Tests for pause, resume, clean, countJobsByStatus, getJobsByStatus
});
