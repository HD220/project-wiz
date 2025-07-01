// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service.fetchNextJobAndLock.spec.ts
// import { randomUUID } from "node:crypto"; // Not needed in this specific file

import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  // afterAll, // Removed as unused
} from "vitest";

import { JobEntity, JobStatus } from "../../../../core/domain/job/job.entity";
// import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo"; // Removed as unused
import { type IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { QueueService } from "../queue.service";

// Newline for import group separation
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
    const fetchedJobProps = fetchedJob!.getProps();
    const addedJobProps = addedJob.getProps();
    expect(fetchedJobProps.id.value).toBe(addedJobProps.id.value);
    expect(fetchedJobProps.status).toBe(JobStatus.ACTIVE);
    expect(fetchedJobProps.workerId).toBe(workerId);
    expect(fetchedJobProps.lockUntil).toBeInstanceOf(Date);
    expect(fetchedJobProps.lockUntil!.getTime()).toBeGreaterThan(Date.now());
    expect(fetchedJobProps.processedOn).toBeInstanceOf(Date);
    expect(fetchedJobProps.attemptsMade).toBe(1);
    expect(queueService.emit).toHaveBeenCalledWith("job.active", fetchedJob);

    const jobFromDb = await jobRepository.findById(addedJobProps.id);
    expect(jobFromDb).not.toBeNull();
    const jobFromDbProps = jobFromDb!.getProps();
    expect(jobFromDbProps.status).toBe(JobStatus.ACTIVE);
    expect(jobFromDbProps.workerId).toBe(workerId);
  });
});
