import BetterSqlite3 from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'; // afterEach removed as it was unused

import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
// JobIdVO and IJobOptions are not directly used in this spec's scope, only within JobEntity.create.
// To clear unused var warnings, they are commented out. If needed for specific tests, they can be re-imported.
// import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
// import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

import * as schema from '../schema';

import { DrizzleJobRepository } from './drizzle-job.repository';

// Define more specific types for payload and result for these tests
interface TestJobPayload { data?: string; order?: number; newData?: string; [key: string]: unknown; }
interface TestJobResult { [key: string]: unknown; }


// Helper function to create a job entity for tests
const createTestJob = (
  props: Partial<Parameters<typeof JobEntity.create<TestJobPayload, TestJobResult>>[0]> = {}
): JobEntity<TestJobPayload, TestJobResult> => {
  return JobEntity.create<TestJobPayload, TestJobResult>({
    queueName: 'test-queue',
    name: 'test-job-name',
    payload: { data: 'sample' }, // Default payload
    options: { priority: 10, attempts: 1 }, // Default options
    ...props, // Spread any overrides
  });
};

describe('DrizzleJobRepository Integration Tests', () => {
  let testDb: BetterSQLite3Database<typeof schema>;
  let sqliteInstance: BetterSqlite3.Database;
  let repository: DrizzleJobRepository;

  beforeAll(() => {
    sqliteInstance = new BetterSqlite3(':memory:');
    testDb = drizzle(sqliteInstance, { schema });
    // Path to migrations folder from the perspective of the test execution context
    // Vitest typically runs from the project root.
    migrate(testDb, { migrationsFolder: './src_refactored/infrastructure/persistence/drizzle/migrations' });
  });

  afterAll(() => {
    sqliteInstance.close();
  });

  beforeEach(async () => {
    repository = new DrizzleJobRepository(testDb);
    // Clean database before each test
    await testDb.delete(schema.jobsTable);
  });

  describe('save and findById', () => {
    it('should save a new job and find it by ID', async () => {
      const job = createTestJob();
      await repository.save(job);

      const foundJob = await repository.findById(job.id);
      expect(foundJob).not.toBeNull();
      expect(foundJob!.id.equals(job.id)).toBe(true);
      expect(foundJob!.name).toBe(job.name);
      expect(foundJob!.payload).toEqual(job.payload);
    });

    it('save should update an existing job (upsert behavior)', async () => {
      const job = createTestJob();
      await repository.save(job);

      job.updateProgress(50);
      (job.payload as TestJobPayload).newData = 'updated'; // Use defined TestJobPayload type
      await repository.save(job); // Save again with changes

      const foundJob = await repository.findById(job.id) as JobEntity<TestJobPayload, TestJobResult> | null; // Assert type for foundJob
      expect(foundJob).not.toBeNull();
      expect(foundJob!.progress).toBe(50);
      expect(foundJob!.payload.newData).toBe('updated');
    });
  });

  describe('update', () => {
    it('should update an existing job properties', async () => {
      const job = createTestJob();
      await repository.save(job); // Initial save

      job.updateProgress(75);
      job.addLog('Update log');
      await repository.update(job);

      const updatedJob = await repository.findById(job.id);
      expect(updatedJob).not.toBeNull();
      expect(updatedJob!.progress).toBe(75);
      expect(updatedJob!.logs.length).toBe(1);
      expect(updatedJob!.logs[0].message).toBe('Update log');
    });
  });

  describe('findNextJobsToProcess', () => {
    it('should find WAITING jobs ordered by priority then createdAt', async () => {
      const job1 = createTestJob({ options: { priority: 5 } }); // Higher priority
      const job2 = createTestJob({ options: { priority: 10 } }); // Lower priority
      const job3Delayed = createTestJob({ options: { priority: 1, delay: 10000 } }); // Renamed variable

      await repository.save(job2); // Saved first, lower priority
      await repository.save(job1); // Saved second, higher priority
      await repository.save(job3Delayed);

      const nextJobs = await repository.findNextJobsToProcess('test-queue', 3);
      expect(nextJobs.length).toBe(2); // job3Delayed is delayed
      expect(nextJobs[0].id.equals(job1.id)).toBe(true); // job1 first due to priority
      expect(nextJobs[1].id.equals(job2.id)).toBe(true);
    });

    it('should find DELAYED jobs whose delayUntil has passed', async () => {
      const pastDelay = new Date(Date.now() - 5000);
      const jobDelayedPast = createTestJob({ options: { delay: 1 } });
      // Manually set properties for test scenario using type assertion for props
      (jobDelayedPast.props as { createdAt: Date; delayUntil: Date; status: JobStatus }).createdAt = new Date(Date.now() - 10000);
      (jobDelayedPast.props as { delayUntil: Date }).delayUntil = pastDelay;
      (jobDelayedPast.props as { status: JobStatus }).status = JobStatus.DELAYED;
      await repository.save(jobDelayedPast);

      const nextJobs = await repository.findNextJobsToProcess('test-queue', 1);
      expect(nextJobs.length).toBe(1);
      expect(nextJobs[0].id.equals(jobDelayedPast.id)).toBe(true);
    });
  });

  describe('acquireLock and extendLock', () => {
    it('should acquire a lock for an available job', async () => {
      const job = createTestJob();
      await repository.save(job);

      const workerId = 'worker-1';
      const lockUntil = new Date(Date.now() + 30000);
      const locked = await repository.acquireLock(job.id, workerId, lockUntil);
      expect(locked).toBe(true);

      const lockedJob = await repository.findById(job.id);
      expect(lockedJob!.status).toBe(JobStatus.ACTIVE);
      expect(lockedJob!.workerId).toBe(workerId);
      expect(lockedJob!.lockUntil!.getTime()).toBeCloseTo(lockUntil.getTime());
    });

    it('should not acquire a lock if job is already locked by another worker', async () => {
      const job = createTestJob();
      await repository.save(job);
      await repository.acquireLock(job.id, 'worker-1', new Date(Date.now() + 30000));

      const lockedByOther = await repository.acquireLock(job.id, 'worker-2', new Date(Date.now() + 30000));
      expect(lockedByOther).toBe(false);
    });

    it('should acquire a lock if existing lock has expired', async () => {
      const job = createTestJob();
      await repository.save(job);
      // Acquire lock that is already expired
      await repository.acquireLock(job.id, 'worker-1', new Date(Date.now() - 1000));

      const acquired = await repository.acquireLock(job.id, 'worker-2', new Date(Date.now() + 30000));
      expect(acquired).toBe(true);
      const lockedJob = await repository.findById(job.id);
      expect(lockedJob!.workerId).toBe('worker-2');
    });

    it('should extend an existing lock', async () => {
      const job = createTestJob();
      await repository.save(job);
      const workerId = 'worker-1';
      await repository.acquireLock(job.id, workerId, new Date(Date.now() + 10000));

      const newLockUntil = new Date(Date.now() + 60000);
      await repository.extendLock(job.id, workerId, newLockUntil);

      const extendedLockJob = await repository.findById(job.id);
      expect(extendedLockJob!.lockUntil!.getTime()).toBeCloseTo(newLockUntil.getTime());
    });
  });

  describe('findStalledJobs', () => {
    it('should find active jobs whose lock has expired', async () => {
        const job = createTestJob();
        await repository.save(job);

        const workerId = 'worker-stalled';
        const expiredLockUntil = new Date(Date.now() - 1000); // Lock already expired
        // Manually update to ACTIVE with expired lock
        job.moveToActive(workerId, expiredLockUntil);
        await repository.update(job); // Persist this state

        const stalledJobs = await repository.findStalledJobs('test-queue', new Date(), 1);
        expect(stalledJobs.length).toBe(1);
        expect(stalledJobs[0].id.equals(job.id)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a job from the repository', async () => {
      const job = createTestJob();
      await repository.save(job);
      await repository.remove(job.id);
      const foundJob = await repository.findById(job.id);
      expect(foundJob).toBeNull();
    });
  });

  describe('getJobsByStatus', () => {
    it('should retrieve jobs by specified statuses with pagination and ordering', async () => {
      const jobW1 = createTestJob({ payload: { order: 1 } }); // WAITING by default
      const jobW2 = createTestJob({ payload: { order: 2 } });
      const jobA1 = createTestJob({ payload: { order: 3 } });
      jobA1.moveToActive('w1', new Date(Date.now() + 1000));

      await repository.save(jobW1);
      await repository.save(jobA1); // Saved second
      await repository.save(jobW2); // Saved third

      // Get all WAITING jobs, should be 2 (jobW1, jobW2)
      const waitingJobs = await repository.getJobsByStatus('test-queue', [JobStatus.WAITING], 0, 10, true); // asc
      expect(waitingJobs.length).toBe(2);
      expect(waitingJobs[0].id.equals(jobW1.id)).toBe(true); // jobW1 created first
      expect(waitingJobs[1].id.equals(jobW2.id)).toBe(true);

      // Get 1 ACTIVE job
      const activeJobs = await repository.getJobsByStatus('test-queue', [JobStatus.ACTIVE], 0, 1);
      expect(activeJobs.length).toBe(1);
      expect(activeJobs[0].id.equals(jobA1.id)).toBe(true);
    });
  });

  describe('countJobsByStatus', () => {
    it('should count jobs by their status', async () => {
      await repository.save(createTestJob()); // WAITING
      await repository.save(createTestJob()); // WAITING
      const activeJob = createTestJob();
      activeJob.moveToActive('w1', new Date(Date.now() + 1000));
      await repository.save(activeJob); // ACTIVE

      const counts = await repository.countJobsByStatus('test-queue');
      expect(counts[JobStatus.WAITING]).toBe(2);
      expect(counts[JobStatus.ACTIVE]).toBe(1);
      expect(counts[JobStatus.COMPLETED]).toBeUndefined();
    });
  });

  describe('clean', () => {
    it('should clean old completed jobs respecting limit and grace period', async () => {
      const veryOldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const recentDate = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago

      const jobOld = createTestJob({ name: 'old' });
      jobOld.moveToActive('w', new Date()); jobOld.markAsCompleted({});
      (jobOld.props as { finishedOn: Date }).finishedOn = veryOldDate; // Type assertion for props
      await repository.save(jobOld);

      const jobRecent = createTestJob({ name: 'recent' });
      jobRecent.moveToActive('w', new Date()); jobRecent.markAsCompleted({});
      (jobRecent.props as { finishedOn: Date }).finishedOn = recentDate; // Type assertion for props
      await repository.save(jobRecent);

      const jobFailedOld = createTestJob({name: 'failedOld'});
      jobFailedOld.moveToActive('w',new Date()); jobFailedOld.markAsFailed("err");
      (jobFailedOld.props as { finishedOn: Date }).finishedOn = veryOldDate; // Type assertion for props
      await repository.save(jobFailedOld);

      // Clean jobs older than 1 day, limit 1
      const cleanedCount = await repository.clean('test-queue', 24 * 60 * 60 * 1000, 1, JobStatus.COMPLETED);
      expect(cleanedCount).toBe(1);

      const foundOld = await repository.findById(jobOld.id);
      expect(foundOld).toBeNull(); // jobOld (completed) should be cleaned
      const foundRecent = await repository.findById(jobRecent.id);
      expect(foundRecent).not.toBeNull(); // jobRecent (completed) should remain
      const foundFailedOld = await repository.findById(jobFailedOld.id);
      expect(foundFailedOld).not.toBeNull(); // jobFailedOld should remain (status specific clean)
    });

    it('should clean old completed or failed jobs if status is not specified', async () => {
        const oldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
        const jobCompletedOld = createTestJob({name: 'c-old'});
        jobCompletedOld.moveToActive('w',new Date()); jobCompletedOld.markAsCompleted({});
        (jobCompletedOld.props as { finishedOn: Date }).finishedOn = oldDate; // Type assertion
        await repository.save(jobCompletedOld);

        const jobFailedOld = createTestJob({name: 'f-old'});
        jobFailedOld.moveToActive('w',new Date()); jobFailedOld.markAsFailed("err");
        (jobFailedOld.props as { finishedOn: Date }).finishedOn = oldDate; // Type assertion
        await repository.save(jobFailedOld);

        const jobWaiting = createTestJob({name: 'w-old'}); // Waiting, should not be cleaned by this
        (jobWaiting.props as { createdAt: Date, finishedOn?: Date }).createdAt = oldDate;
        (jobWaiting.props as { finishedOn?: Date }).finishedOn = undefined; // Type assertion
        await repository.save(jobWaiting);

        const cleanedCount = await repository.clean('test-queue', 24*60*60*1000, 5); // Clean jobs older than 1 day, no specific status
        expect(cleanedCount).toBe(2); // Both completedOld and failedOld

        expect(await repository.findById(jobCompletedOld.id)).toBeNull();
        expect(await repository.findById(jobFailedOld.id)).toBeNull();
        expect(await repository.findById(jobWaiting.id)).not.toBeNull();
    });
  });
});
