import { randomUUID } from "node:crypto";

import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";

import { JobEntity, JobStatus } from "../../../../core/domain/job/job.entity";
import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo";
import { type IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo"; // Use type import
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository"; // Import real repository
import { QueueService } from "../queue.service";

import {
  TestDb,
  createTestDbClient,
  runMigrations,
  clearDatabaseTables,
} from "./test-db.helper";

describe("QueueService (Integration with In-Memory DB)", () => {
  let db: TestDb;
  let jobRepository: DrizzleJobRepository;
  let queueService: QueueService<{ email: string }, { status: string }>;
  const queueName = "test-email-queue";
  const defaultJobOpts: IJobOptions = {
    attempts: 1,
    delay: 0,
    priority: 0,
    removeOnComplete: false,
    removeOnFail: false,
    maxStalledCount: 3,
  };

  beforeAll(async () => {
    db = createTestDbClient({ memory: true });
    await runMigrations(db);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabaseTables(db);

    jobRepository = new DrizzleJobRepository(db);
    queueService = new QueueService(queueName, jobRepository, defaultJobOpts);
    vi.spyOn(queueService, "emit");
  });

  afterEach(async () => {
    // Made async
    if (queueService) {
      await queueService.close();
    }
    vi.restoreAllMocks();
  });

  describe("add", () => {
    it("should create a job, save it to DB, and emit job.added event", async () => {
      const jobData = { email: "test@example.com" };
      const jobName = "send-welcome-email";

      const createdJob = await queueService.add(jobName, jobData);

      expect(createdJob).toBeInstanceOf(JobEntity);
      expect(createdJob.name).toBe(jobName);
      expect(createdJob.payload).toEqual(jobData);
      expect(createdJob.queueName).toBe(queueName);
      expect(createdJob.options.attempts).toBe(defaultJobOpts.attempts);
      expect(queueService.emit).toHaveBeenCalledWith("job.added", createdJob);

      // Verify job is in the database
      const jobFromDb = await jobRepository.findById(createdJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.id.value).toBe(createdJob.id.value);
      expect(jobFromDb!.name).toBe(jobName);
      expect(jobFromDb!.payload).toEqual(jobData);
    });

    it("should apply custom options when adding a job, and save to DB", async () => {
      const jobData = { email: "custom@example.com" };
      const jobName = "custom-options-job";
      const validCustomJobId = randomUUID();
      const customOpts: IJobOptions = {
        attempts: 5,
        delay: 5000,
        priority: 1,
        jobId: validCustomJobId,
      };

      const createdJob = await queueService.add(jobName, jobData, customOpts);

      expect(createdJob.id.value).toBe(validCustomJobId);
      expect(createdJob.options.attempts).toBe(5);
      expect(createdJob.options.delay).toBe(5000);
      expect(createdJob.options.priority).toBe(1);
      expect(createdJob.status).toBe(JobStatus.DELAYED);

      const jobFromDb = await jobRepository.findById(createdJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.id.value).toBe(validCustomJobId);
      expect(jobFromDb!.options.priority).toBe(1);
    });
  });

  describe("addBulk", () => {
    it("should add multiple jobs to DB, and emit events", async () => {
      const jobsToAdd = [
        { name: "bulk1", data: { email: "b1@example.com" } },
        {
          name: "bulk2",
          data: { email: "b2@example.com" },
          opts: { priority: 1 },
        },
      ];

      const addedJobs = await queueService.addBulk(jobsToAdd);

      expect(addedJobs.length).toBe(2);
      expect(queueService.emit).toHaveBeenCalledTimes(2);

      const job1FromDb = await jobRepository.findById(addedJobs[0].id);
      expect(job1FromDb).not.toBeNull();
      expect(job1FromDb!.name).toBe("bulk1");
      expect(job1FromDb!.payload).toEqual({ email: "b1@example.com" });
      expect(queueService.emit).toHaveBeenCalledWith("job.added", addedJobs[0]);

      const job2FromDb = await jobRepository.findById(addedJobs[1].id);
      expect(job2FromDb).not.toBeNull();
      expect(job2FromDb!.name).toBe("bulk2");
      expect(job2FromDb!.options.priority).toBe(1);
      expect(queueService.emit).toHaveBeenCalledWith("job.added", addedJobs[1]);
    });
  });

  describe("getJob", () => {
    it("should retrieve a job from DB by JobIdVO", async () => {
      const jobData = { email: "find@me.com" };
      const jobName = "find-me";
      const addedJob = await queueService.add(jobName, jobData);
      const foundJob = await queueService.getJob(addedJob.id);

      expect(foundJob).not.toBeNull();
      expect(foundJob!.id.value).toBe(addedJob.id.value);
      expect(foundJob!.name).toBe(jobName);
    });

    it("should retrieve a job from DB by string ID", async () => {
      const jobData = { email: "find@me-str.com" };
      const jobName = "find-me-str";
      const addedJob = await queueService.add(jobName, jobData);

      const foundJob = await queueService.getJob(addedJob.id.value);

      expect(foundJob).not.toBeNull();
      expect(foundJob!.id.value).toBe(addedJob.id.value);
    });
  });

  describe("fetchNextJobAndLock", () => {
    const workerId = "worker-007";
    const lockDurationMs = 30000;

    it("should return null if no jobs are available in DB", async () => {
      const job = await queueService.fetchNextJobAndLock(
        workerId,
        lockDurationMs
      );
      expect(job).toBeNull();
    });

    it("should return null if lock cannot be acquired (e.g. another worker got it - harder to test without true concurrency)", async () => {
      const addedJob = await queueService.add("job1", {
        email: "e1@example.com",
      });

      const fetchedAndLockedJob = await queueService.fetchNextJobAndLock(
        workerId,
        lockDurationMs
      );
      expect(fetchedAndLockedJob).not.toBeNull();

      const anotherAttempt = await queueService.fetchNextJobAndLock(
        "worker-008",
        lockDurationMs
      );
      expect(anotherAttempt).toBeNull();
    });

    it("should fetch, lock, update job to active in DB, and emit event", async () => {
      const addedJob = await queueService.add("job2", {
        email: "e2@example.com",
      });

      const fetchedJob = await queueService.fetchNextJobAndLock(
        workerId,
        lockDurationMs
      );

      expect(fetchedJob).not.toBeNull();
      expect(fetchedJob!.id.value).toBe(addedJob.id.value);
      expect(fetchedJob!.status).toBe(JobStatus.ACTIVE);
      expect(fetchedJob!.workerId).toBe(workerId);
      expect(fetchedJob!.lockUntil).toBeInstanceOf(Date);
      expect(fetchedJob!.lockUntil!.getTime()).toBeGreaterThan(Date.now());
      expect(fetchedJob!.processedOn).toBeInstanceOf(Date);
      expect(fetchedJob!.attemptsMade).toBe(1);
      expect(queueService.emit).toHaveBeenCalledWith("job.active", fetchedJob);

      // Verify in DB
      const jobFromDb = await jobRepository.findById(addedJob.id);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.ACTIVE);
      expect(jobFromDb!.workerId).toBe(workerId);
    });
  });

  describe("extendJobLock", () => {
    let jobId: JobIdVO;
    const workerId = "worker-extend";
    const lockDurationMs = 15000;

    beforeEach(async () => {
      jobId = JobIdVO.create();
      const jobOptions: IJobOptions = { jobId: jobId.value };
      await queueService.add(
        "extend-me",
        { email: "extend@example.com" },
        jobOptions
      );
      const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000); // Short initial lock
      expect(activeJob).not.toBeNull();
      expect(activeJob!.id.value).toBe(jobId.value);
    });

    it("should extend lock for an active job owned by the worker", async () => {
      const jobBeforeExtend = await jobRepository.findById(jobId);
      expect(jobBeforeExtend).not.toBeNull();
      const originalLockUntil = jobBeforeExtend!.lockUntil;

      await queueService.extendJobLock(jobId, workerId, lockDurationMs);

      const jobAfterExtend = await jobRepository.findById(jobId);
      expect(jobAfterExtend).not.toBeNull();
      expect(jobAfterExtend!.lockUntil!.getTime()).toBeGreaterThan(
        originalLockUntil!.getTime()
      );
      expect(jobAfterExtend!.lockUntil!.getTime()).toBeGreaterThanOrEqual(
        Date.now() + lockDurationMs - 2000
      ); // Approx, allow for test execution time
      expect(queueService.emit).toHaveBeenCalledWith(
        "job.lock.extended",
        expect.objectContaining({ id: jobId })
      );
    });

    it("should accept string job ID for extendJobLock", async () => {
      await queueService.extendJobLock(jobId.value, workerId, lockDurationMs);
      const jobAfterExtend = await jobRepository.findById(jobId);
      expect(jobAfterExtend).not.toBeNull();
      expect(jobAfterExtend!.lockUntil!.getTime()).toBeGreaterThanOrEqual(
        Date.now() + lockDurationMs - 2000
      );
    });

    it("should not extend lock if job not found", async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.extendJobLock(
        nonExistentJobId,
        workerId,
        lockDurationMs
      );
      expect(queueService.emit).not.toHaveBeenCalledWith(
        "job.lock.extended",
        expect.anything()
      );
    });

    it("should not extend lock if workerId does not match", async () => {
      const jobBeforeExtend = await jobRepository.findById(jobId);
      await queueService.extendJobLock(jobId, "other-worker", lockDurationMs);
      const jobAfterExtend = await jobRepository.findById(jobId);
      expect(jobAfterExtend!.lockUntil!.getTime()).toEqual(
        jobBeforeExtend!.lockUntil!.getTime()
      );
    });

    it("should not extend lock if job is not active", async () => {
      await queueService.markJobAsCompleted(jobId, workerId, {
        status: "done",
      });
      const jobCompleted = await jobRepository.findById(jobId);
      const lockTimeBefore = jobCompleted!.lockUntil;

      await queueService.extendJobLock(jobId, workerId, lockDurationMs);
      const jobAfterAttemptedExtend = await jobRepository.findById(jobId);
      if (lockTimeBefore) {
        expect(jobAfterAttemptedExtend!.lockUntil!.getTime()).toEqual(
          lockTimeBefore.getTime()
        );
      } else {
        expect(jobAfterAttemptedExtend!.lockUntil).toBeNull();
      }
    });
  });

  describe("markJobAsCompleted", () => {
    let jobIdForCompleteTest: JobIdVO;
    const workerIdForCompleteTest = "worker-complete";
    const resultForCompleteTest = { status: "Email Sent!" };

    beforeEach(async () => {
      jobIdForCompleteTest = JobIdVO.create();
      await queueService.add(
        "complete-me",
        { email: "c@ex.com" },
        { jobId: jobIdForCompleteTest.value }
      );
      const activeJob = await queueService.fetchNextJobAndLock(
        workerIdForCompleteTest,
        10000
      );
      if (!activeJob || activeJob.id.value !== jobIdForCompleteTest.value)
        throw new Error("Setup failed for markJobAsCompleted");
    });

    it("should mark job as completed, update DB, and emit event", async () => {
      const jobInstanceFromWorker =
        await jobRepository.findById(jobIdForCompleteTest);
      jobInstanceFromWorker!.addLog(
        "Log from worker before completion",
        "INFO"
      );

      await queueService.markJobAsCompleted(
        jobIdForCompleteTest,
        workerIdForCompleteTest,
        resultForCompleteTest,
        jobInstanceFromWorker!
      );

      const jobFromDb = await jobRepository.findById(jobIdForCompleteTest);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
      expect(jobFromDb!.returnValue).toEqual(resultForCompleteTest);
      expect(jobFromDb!.finishedOn).toBeInstanceOf(Date);
      expect(
        jobFromDb!.logs.some(
          (log) => log.message === "Log from worker before completion"
        )
      ).toBe(false);

      expect(queueService.emit).toHaveBeenCalledWith(
        "job.completed",
        expect.objectContaining({
          id: jobIdForCompleteTest,
          status: JobStatus.COMPLETED,
        })
      );
    });

    it("should accept string job ID for markJobAsCompleted", async () => {
      await queueService.markJobAsCompleted(
        jobIdForCompleteTest.value,
        workerIdForCompleteTest,
        resultForCompleteTest
      );
      const jobFromDb = await jobRepository.findById(jobIdForCompleteTest);
      expect(jobFromDb!.status).toBe(JobStatus.COMPLETED);
    });

    it("should not complete if job not found in DB", async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.markJobAsCompleted(
        nonExistentJobId,
        workerIdForCompleteTest,
        resultForCompleteTest
      );
      expect(queueService.emit).not.toHaveBeenCalledWith(
        "job.completed",
        expect.objectContaining({ id: nonExistentJobId })
      );
    });

    it("should not complete if workerId does not match job in DB", async () => {
      await queueService.markJobAsCompleted(
        jobIdForCompleteTest,
        "another-worker",
        resultForCompleteTest
      );
      const jobFromDb = await jobRepository.findById(jobIdForCompleteTest);
      expect(jobFromDb!.status).toBe(JobStatus.ACTIVE);
      expect(queueService.emit).not.toHaveBeenCalledWith(
        "job.completed",
        expect.anything()
      );
    });
  });

  describe("markJobAsFailed", () => {
    let jobToFailPermanentlyId: JobIdVO;
    let jobToRetryId: JobIdVO;
    const workerIdForFailTest = "worker-fail";
    const errorForFailTest = new Error("Test Job Failed");

    beforeEach(async () => {
      jobToFailPermanentlyId = JobIdVO.create();
      await queueService.add(
        "fail-me-permanently",
        { email: "f-perm@ex.com" },
        { jobId: jobToFailPermanentlyId.value, attempts: 1 }
      );
      const activeJobPerm = await queueService.fetchNextJobAndLock(
        workerIdForFailTest,
        10000
      );
      if (
        !activeJobPerm ||
        activeJobPerm.id.value !== jobToFailPermanentlyId.value
      )
        throw new Error("Setup failed for jobToFailPermanently");

      jobToRetryId = JobIdVO.create();
      await queueService.add(
        "fail-me-with-retries",
        { email: "f-retry@ex.com" },
        {
          jobId: jobToRetryId.value,
          attempts: 3,
          backoff: { type: "exponential", delay: 100 },
        }
      );
      const activeJobRetry = await queueService.fetchNextJobAndLock(
        workerIdForFailTest,
        10000
      );
      if (!activeJobRetry || activeJobRetry.id.value !== jobToRetryId.value)
        throw new Error("Setup failed for jobToRetry");
    });

    it("should mark job as FAILED if attempts exhausted, update DB, and emit event", async () => {
      await queueService.markJobAsFailed(
        jobToFailPermanentlyId,
        workerIdForFailTest,
        errorForFailTest
      );

      const jobFromDb = await jobRepository.findById(jobToFailPermanentlyId);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.FAILED);
      expect(jobFromDb!.failedReason).toBe(errorForFailTest.message);
      expect(jobFromDb!.finishedOn).toBeInstanceOf(Date);
      expect(queueService.emit).toHaveBeenCalledWith(
        "job.failed",
        expect.objectContaining({
          id: jobToFailPermanentlyId,
          status: JobStatus.FAILED,
        })
      );
    });

    it("should mark job as DELAYED if retries are pending, update DB, and emit event", async () => {
      await queueService.markJobAsFailed(
        jobToRetryId,
        workerIdForFailTest,
        errorForFailTest
      );

      const jobFromDb = await jobRepository.findById(jobToRetryId);
      expect(jobFromDb).not.toBeNull();
      expect(jobFromDb!.status).toBe(JobStatus.DELAYED);
      expect(jobFromDb!.failedReason).toBe(errorForFailTest.message);
      expect(jobFromDb!.delayUntil).toBeInstanceOf(Date);
      expect(jobFromDb!.delayUntil!.getTime()).toBeGreaterThanOrEqual(
        Date.now() + 90
      ); // Approx 100ms
      expect(jobFromDb!.attemptsMade).toBe(1);
      expect(queueService.emit).toHaveBeenCalledWith(
        "job.failed",
        expect.objectContaining({ id: jobToRetryId, status: JobStatus.DELAYED })
      );
    });

    it("should accept string job ID for markJobAsFailed", async () => {
      await queueService.markJobAsFailed(
        jobToFailPermanentlyId.value,
        workerIdForFailTest,
        errorForFailTest
      );
      const jobFromDb = await jobRepository.findById(jobToFailPermanentlyId);
      expect(jobFromDb!.status).toBe(JobStatus.FAILED);
    });
  });

  describe("updateJobProgress", () => {
    let jobId: JobIdVO;
    const workerId = "worker-progress";

    beforeEach(async () => {
      jobId = JobIdVO.create();
      await queueService.add(
        "progress-me",
        { email: "progress@example.com" },
        { jobId: jobId.value }
      );
      const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000);
      if (!activeJob || activeJob.id.value !== jobId.value)
        throw new Error("Setup failed for updateJobProgress");
    });

    it("should update progress in DB, and emit event", async () => {
      await queueService.updateJobProgress(jobId, workerId, 50);
      let jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.progress).toBe(50);
      expect(queueService.emit).toHaveBeenCalledWith(
        "job.progress",
        expect.objectContaining({ id: jobId, progress: 50 })
      );

      await queueService.updateJobProgress(jobId, workerId, {
        stage: "processing",
      });
      jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.progress).toEqual({ stage: "processing" });
      expect(queueService.emit).toHaveBeenCalledWith(
        "job.progress",
        expect.objectContaining({
          id: jobId,
          progress: { stage: "processing" },
        })
      );
    });

    it("should not update progress if job not found or worker mismatch", async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.updateJobProgress(nonExistentJobId, workerId, 75);

      await queueService.updateJobProgress(jobId, "other-worker", 75);
      const jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.progress).not.toBe(75);
    });
  });

  describe("addJobLog", () => {
    let jobId: JobIdVO;
    const workerId = "worker-log";

    beforeEach(async () => {
      jobId = JobIdVO.create();
      await queueService.add(
        "log-me",
        { email: "log@example.com" },
        { jobId: jobId.value }
      );
      const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000);
      if (!activeJob || activeJob.id.value !== jobId.value)
        throw new Error("Setup failed for addJobLog");
    });

    it("should add log to DB, and emit event", async () => {
      const message = "Test log message";
      const level = "DEBUG";
      await queueService.addJobLog(jobId, workerId, message, level);

      const jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.logs.length).toBe(1);
      expect(jobFromDb!.logs[0].message).toBe(message);
      expect(jobFromDb!.logs[0].level).toBe(level);
      expect(jobFromDb!.logs[0].timestamp).toBeInstanceOf(Date);
      expect(queueService.emit).toHaveBeenCalledWith(
        "job.log",
        expect.objectContaining({ id: jobId })
      );
    });

    it("should not add log if job not found or worker mismatch", async () => {
      const nonExistentJobId = JobIdVO.create();
      await queueService.addJobLog(nonExistentJobId, workerId, "test", "INFO");
      // No error, no emit

      await queueService.addJobLog(jobId, "other-worker", "test", "INFO");
      const jobFromDb = await jobRepository.findById(jobId);
      expect(jobFromDb!.logs.length).toBe(0);
    });
  });

  describe("startMaintenance (Stalled Jobs)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(async () => {
      await queueService.stopMaintenance();
      await vi.runAllTimersAsync();
      vi.useRealTimers();
    });

    it("should periodically check for stalled jobs in DB and handle them", async () => {
      const stalledJob1Id = JobIdVO.create();
      let job1 = JobEntity.create({
        // id: stalledJob1Id,
        queueName,
        name: "stalled1",
        payload: { email: "s1@ex.com" },
        options: { attempts: 1, jobId: stalledJob1Id.value },
      });
      job1.props.status = JobStatus.ACTIVE;
      job1.props.workerId = "stalled-worker";
      job1.props.lockUntil = new Date(Date.now() - 100000);
      job1.props.processedOn = new Date(Date.now() - 100001);
      job1.props.attemptsMade = 1;
      await jobRepository.save(job1);

      const stalledJob2Id = JobIdVO.create();
      let job2 = JobEntity.create({
        queueName,
        name: "stalled2",
        payload: { email: "s2@ex.com" },
        options: { attempts: 2, jobId: stalledJob2Id.value },
      });
      // Manually set properties
      job2.props.status = JobStatus.ACTIVE;
      job2.props.workerId = "stalled-worker-2";
      job2.props.lockUntil = new Date(Date.now() - 100000);
      job2.props.processedOn = new Date(Date.now() - 100001);
      job2.props.attemptsMade = 1;
      await jobRepository.save(job2);

      queueService.startMaintenance();

      // Allow the first maintenance run
      await vi.advanceTimersByTimeAsync(1);
      await vi.advanceTimersByTimeAsync(queueService["maintenanceIntervalMs"]);

      const job1AfterStall = await jobRepository.findById(stalledJob1Id);
      expect(job1AfterStall!.status).toBe(JobStatus.FAILED);
      expect(job1AfterStall!.failedReason).toContain("Stalled");

      const job2AfterStall = await jobRepository.findById(stalledJob2Id);
      expect(job2AfterStall!.status).toBe(JobStatus.WAITING);
      expect(job2AfterStall!.stalledCount).toBe(1);
      expect(job2AfterStall!.workerId).toBeNull();

      const findStalledJobsSpy = vi.spyOn(jobRepository, "findStalledJobs");
      await vi.advanceTimersByTimeAsync(
        queueService["maintenanceIntervalMs"] + 1
      );
      expect(findStalledJobsSpy).toHaveBeenCalledTimes(1);

      await queueService.stopMaintenance();
      await vi.runAllTimersAsync();
      findStalledJobsSpy.mockRestore();
    });
  });

  describe("pause", () => {
    it("should emit queue.paused event", async () => {
      await queueService.pause();
      expect(queueService.emit).toHaveBeenCalledWith("queue.paused");
    });
  });

  describe("resume", () => {
    it("should emit queue.resumed event", async () => {
      await queueService.resume();
      expect(queueService.emit).toHaveBeenCalledWith("queue.resumed");
    });
  });

  describe("clean", () => {
    it("should call jobRepository.clean and return the count", async () => {
      const gracePeriodMs = 60000;
      const limit = 10;
      const status = JobStatus.COMPLETED;

      await queueService.add(
        "c1",
        { email: "c1@c.c" },
        { jobId: JobIdVO.create().value }
      );
      const j1 = await queueService.fetchNextJobAndLock("w", 1);
      await queueService.markJobAsCompleted(j1!.id, "w", { status: "ok" });
      const job1Entity = await jobRepository.findById(j1!.id);
      job1Entity!.props.finishedOn = new Date(Date.now() - gracePeriodMs * 2);
      await jobRepository.update(job1Entity!);

      const cleanedCount = await queueService.clean(
        gracePeriodMs,
        limit,
        status
      );
      expect(cleanedCount).toBe(1);

      const jobAfterClean = await jobRepository.findById(j1!.id);
      expect(jobAfterClean).toBeNull();
    });
  });

  describe("countJobsByStatus", () => {
    it("should call jobRepository.countJobsByStatus and return the counts", async () => {
      await queueService.add("w1", { email: "w1@w.c" });
      await queueService.add("w2", { email: "w2@w.c" });
      const jf = await queueService.add(
        "f1",
        { email: "f1@f.c" },
        { attempts: 1 }
      );
      const activeJf = await queueService.fetchNextJobAndLock("w", 1);
      await queueService.markJobAsFailed(activeJf!.id, "w", new Error("fail"));

      const statuses = [JobStatus.WAITING, JobStatus.FAILED];
      const counts = await queueService.countJobsByStatus(statuses);

      expect(counts[JobStatus.WAITING]).toBe(2);
      expect(counts[JobStatus.FAILED]).toBe(1);
    });
  });

  describe("getJobsByStatus", () => {
    it("should call jobRepository.getJobsByStatus and return mapped jobs", async () => {
      const jc1 = await queueService.add("jc1", { email: "jc1@c.c" });
      const active_jc1 = await queueService.fetchNextJobAndLock("w", 1);
      await queueService.markJobAsCompleted(active_jc1!.id, "w", {
        status: "ok",
      });

      const jc2 = await queueService.add("jc2", { email: "jc2@c.c" });
      const active_jc2 = await queueService.fetchNextJobAndLock("w", 1);
      await queueService.markJobAsCompleted(active_jc2!.id, "w", {
        status: "ok",
      });

      const statuses = [JobStatus.COMPLETED];
      const result = await queueService.getJobsByStatus(statuses, 0, 10, true);

      expect(result.length).toBe(2);
      expect(result[0].id.value).toBe(jc1.id.value);
      expect(result[1].id.value).toBe(jc2.id.value);
      expect(result[0].status).toBe(JobStatus.COMPLETED);
    });
  });
});
