// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service.extendJobLock.spec.ts
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";

// JobStatus removed, JobEntity was also unused
import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo";
import { type IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { DrizzleQueueFacade as QueueService } from "../drizzle-queue.facade";

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

describe("QueueService - extendJobLock", () => {
  let jobId: JobIdVO;
  const workerId = "worker-extend";
  const lockDurationMs = 15000;

  beforeEach(async () => { // This beforeEach is specific to this describe block
    jobId = JobIdVO.create();
    const jobOptions: IJobOptions = { jobId: jobId.value };
    await queueService.add(
      "extend-me",
      { email: "extend@example.com" },
      jobOptions
    );
    const activeJob = await queueService.fetchNextJobAndLock(workerId, 10000);
    expect(activeJob).not.toBeNull();
    expect(activeJob!.getProps().id.value).toBe(jobId.value);
  });

  it("should extend lock for an active job owned by the worker", async () => {
    const jobBeforeExtend = await jobRepository.findById(jobId);
    expect(jobBeforeExtend).not.toBeNull();
    const originalLockUntil = jobBeforeExtend!.getProps().lockUntil;

    await queueService.extendJobLock(jobId, workerId, lockDurationMs);

    const jobAfterExtend = await jobRepository.findById(jobId);
    expect(jobAfterExtend).not.toBeNull();
    const jobAfterExtendProps = jobAfterExtend!.getProps();
    expect(jobAfterExtendProps.lockUntil!.getTime()).toBeGreaterThan(
      originalLockUntil!.getTime()
    );
    expect(jobAfterExtendProps.lockUntil!.getTime()).toBeGreaterThanOrEqual(
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
    expect(jobAfterExtend!.getProps().lockUntil!.getTime()).toBeGreaterThanOrEqual(
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
    expect(jobBeforeExtend).not.toBeNull();
    const originalLockTime = jobBeforeExtend!.getProps().lockUntil!.getTime();

    await queueService.extendJobLock(jobId, "other-worker", lockDurationMs);
    const jobAfterExtend = await jobRepository.findById(jobId);
    expect(jobAfterExtend!.getProps().lockUntil!.getTime()).toEqual(originalLockTime);
  });

  it("should not extend lock if job is not active", async () => {
    await queueService.markJobAsCompleted(jobId, workerId, {
      status: "done",
    });
    const jobCompleted = await jobRepository.findById(jobId);
    expect(jobCompleted).not.toBeNull();
    const lockTimeBefore = jobCompleted!.getProps().lockUntil;

    await queueService.extendJobLock(jobId, workerId, lockDurationMs);
    const jobAfterAttemptedExtend = await jobRepository.findById(jobId);
    expect(jobAfterAttemptedExtend).not.toBeNull();
    if (lockTimeBefore) {
      expect(jobAfterAttemptedExtend!.getProps().lockUntil!.getTime()).toEqual(
        lockTimeBefore.getTime()
      );
    } else {
      expect(jobAfterAttemptedExtend!.getProps().lockUntil).toBeNull();
    }
  });
});
