// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service.markJobAsCompleted.spec.ts
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
  // Provide payload type for QueueService instantiation
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

describe("QueueService - markJobAsCompleted", () => {
  let jobIdForCompleteTest: JobIdVO;
  const workerIdForCompleteTest = "worker-complete";
  const resultForCompleteTest = { status: "Email Sent!" };

  beforeEach(async () => { // This beforeEach is specific to this describe block
    jobIdForCompleteTest = JobIdVO.create();
    await queueService.add(
      "complete-me",
      { email: "c@ex.com" }, // Payload matches QueueService type
      { jobId: jobIdForCompleteTest.value }
    );
    const activeJob = await queueService.fetchNextJobAndLock(
      workerIdForCompleteTest,
      10000
    );
    if (!activeJob || activeJob.getProps().id.value !== jobIdForCompleteTest.value)
      throw new Error("Setup failed for markJobAsCompleted");
  });

  it("should mark job as completed, update DB, and emit event", async () => {
    const jobInstanceFromWorker =
      await jobRepository.findById(jobIdForCompleteTest);
    expect(jobInstanceFromWorker).not.toBeNull();
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
    const jobFromDbProps = jobFromDb!.getProps();
    expect(jobFromDbProps.status).toBe(JobStatus.COMPLETED);
    expect(jobFromDbProps.returnValue).toEqual(resultForCompleteTest);
    expect(jobFromDbProps.finishedOn).toBeInstanceOf(Date);
    expect(
      jobFromDbProps.logs.some(
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
    expect(jobFromDb).not.toBeNull();
    expect(jobFromDb!.getProps().status).toBe(JobStatus.COMPLETED);
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
    expect(jobFromDb).not.toBeNull();
    expect(jobFromDb!.getProps().status).toBe(JobStatus.ACTIVE);
    expect(queueService.emit).not.toHaveBeenCalledWith(
      "job.completed",
      expect.anything()
    );
  });
});
