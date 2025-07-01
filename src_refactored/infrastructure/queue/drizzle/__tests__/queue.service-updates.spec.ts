// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service-updates.spec.ts
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";

import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo";
import { IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { DrizzleQueueFacade as QueueService } from "../drizzle-queue.facade";
// import { JobEntity } from "../../../../core/domain/job/job.entity"; // Might be needed for some expect.objectContaining

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

describe("QueueService - updateJobProgress", () => {
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
    // Check that no emit happened for nonExistentJobId for progress
    expect(queueService.emit).not.toHaveBeenCalledWith(
      "job.progress",
      expect.objectContaining({ id: nonExistentJobId })
    );


    await queueService.updateJobProgress(jobId, "other-worker", 75);
    const jobFromDb = await jobRepository.findById(jobId);
    expect(jobFromDb!.progress).not.toBe(75); // Progress should remain as it was
  });
});

describe("QueueService - addJobLog", () => {
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
    expect(queueService.emit).not.toHaveBeenCalledWith(
      "job.log",
      expect.objectContaining({ id: nonExistentJobId })
    );

    await queueService.addJobLog(jobId, "other-worker", "test", "INFO");
    const jobFromDb = await jobRepository.findById(jobId);
    expect(jobFromDb!.logs.length).toBe(0);
  });
});
