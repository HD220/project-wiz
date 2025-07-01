// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service-lifecycle.spec.ts
import { randomUUID } from "node:crypto"; // Needed for custom Job IDs in tests
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
import { IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { QueueService } from "../queue.service";

import {
  TestDb,
  createTestDbClient,
  runMigrations,
  clearDatabaseTables,
} from "./test-db.helper";

// Top-level variables for test context
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
  if (queueService) {
    await queueService.close();
  }
  vi.restoreAllMocks();
});

describe("QueueService - fetchNextJobAndLock", () => {
  const workerId = "worker-007";
  const lockDurationMs = 30000;

  it("should return null if no jobs are available in DB", async () => {
    const job = await queueService.fetchNextJobAndLock(
      workerId,
      lockDurationMs
    );
    expect(job).toBeNull();
  });

  it("should return null if lock cannot be acquired (e.g. another worker got it)", async () => {
    await queueService.add("job1", {
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

    const jobFromDb = await jobRepository.findById(addedJob.id);
    expect(jobFromDb).not.toBeNull();
    expect(jobFromDb!.status).toBe(JobStatus.ACTIVE);
    expect(jobFromDb!.workerId).toBe(workerId);
  });
});

describe("QueueService - extendJobLock", () => {
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
    const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000);
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
    );
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

describe("QueueService - markJobAsCompleted", () => {
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
    ).toBe(false); // Logs from instance are not persisted unless explicitly added via queueService.addJobLog

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
    expect(jobFromDb!.status).toBe(JobStatus.ACTIVE); // Should remain active
    expect(queueService.emit).not.toHaveBeenCalledWith(
      "job.completed",
      expect.anything()
    );
  });
});

describe("QueueService - markJobAsFailed", () => {
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
      Date.now() + 90 // Approx 100ms (backoff delay) - some buffer for execution
    );
    expect(jobFromDb!.attemptsMade).toBe(1); // Assuming fetchNextJobAndLock increments it, then failure means this is the first *failed* attempt logic path
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
