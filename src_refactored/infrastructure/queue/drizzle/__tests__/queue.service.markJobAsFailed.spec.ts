// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service.markJobAsFailed.spec.ts
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
import { type IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
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
let queueService: QueueService<{ email: string }, { status: string }>; // Payload type for add
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
  queueService = new QueueService<{ email: string }, { status: string }>(
    queueName,
    jobRepository,
    defaultJobOpts
  );
  vi.spyOn(queueService, "emit");
});

afterEach(async () => {
  if (queueService) {
    await queueService.close();
  }
  vi.restoreAllMocks();
});

describe("QueueService - markJobAsFailed", () => {
  let jobToFailPermanentlyId: JobIdVO;
  let jobToRetryId: JobIdVO;
  const workerIdForFailTest = "worker-fail";
  const errorForFailTest = new Error("Test Job Failed");

  beforeEach(async () => { // This beforeEach is specific to this describe block
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
      activeJobPerm.getProps().id.value !== jobToFailPermanentlyId.value
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
    if (!activeJobRetry || activeJobRetry.getProps().id.value !== jobToRetryId.value)
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
    const jobFromDbProps = jobFromDb!.getProps();
    expect(jobFromDbProps.status).toBe(JobStatus.FAILED);
    expect(jobFromDbProps.failedReason).toBe(errorForFailTest.message);
    expect(jobFromDbProps.finishedOn).toBeInstanceOf(Date);
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
    const jobFromDbProps = jobFromDb!.getProps();
    expect(jobFromDbProps.status).toBe(JobStatus.DELAYED);
    expect(jobFromDbProps.failedReason).toBe(errorForFailTest.message);
    expect(jobFromDbProps.delayUntil).toBeInstanceOf(Date);
    expect(jobFromDbProps.delayUntil!.getTime()).toBeGreaterThanOrEqual(
      Date.now() + 90
    );
    expect(jobFromDbProps.attemptsMade).toBe(1);
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
    expect(jobFromDb).not.toBeNull();
    expect(jobFromDb!.getProps().status).toBe(JobStatus.FAILED);
  });
});
