// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service-get.spec.ts
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";

import { JobEntity } from "../../../../core/domain/job/job.entity";
import { type IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { QueueService } from "../queue.service";
// import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo"; // Not directly used here but JobEntity uses it

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

describe("QueueService - getJob", () => {
  it("should retrieve a job from DB by JobIdVO", async () => {
    const jobData = { email: "find@me.com" };
    const jobName = "find-me";
    // Need to add a job first to get it
    const addedJob = await queueService.add(jobName, jobData);
    const foundJob = await queueService.getJob(addedJob.getProps().id);

    expect(foundJob).not.toBeNull();
    expect(foundJob!.getProps().id.value).toBe(addedJob.getProps().id.value);
    expect(foundJob!.getProps().name).toBe(jobName);
  });

  it("should retrieve a job from DB by string ID", async () => {
    const jobData = { email: "find@me-str.com" };
    const jobName = "find-me-str";
    // Need to add a job first to get it
    const addedJob = await queueService.add(jobName, jobData);
    const foundJob = await queueService.getJob(addedJob.getProps().id.value);

    expect(foundJob).not.toBeNull();
    expect(foundJob!.getProps().id.value).toBe(addedJob.getProps().id.value);
  });
});
