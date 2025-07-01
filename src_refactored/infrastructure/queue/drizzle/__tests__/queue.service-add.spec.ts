// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service-add.spec.ts
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

// Newline for import group separation
import { JobEntity, JobStatus } from "../../../../core/domain/job/job.entity";
import { IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo"; // Corrected: Use as value
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { QueueService } from "../queue.service";
// import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo"; // Not directly used in this snippet, but likely needed

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

describe("QueueService - add", () => {
  it("should create a job, save it to DB, and emit job.added event", async () => {
    const jobData = { email: "test@example.com" };
    const jobName = "send-welcome-email";

    const createdJob = await queueService.add(jobName, jobData);
    const createdJobProps = createdJob.getProps();

    expect(createdJob).toBeInstanceOf(JobEntity);
    expect(createdJobProps.name).toBe(jobName);
    expect(createdJobProps.payload).toEqual(jobData);
    expect(createdJobProps.queueName).toBe(queueName);
    expect(createdJobProps.options.attempts).toBe(defaultJobOpts.attempts);
    expect(queueService.emit).toHaveBeenCalledWith("job.added", createdJob);

    // Verify job is in the database
    const jobFromDb = await jobRepository.findById(createdJobProps.id);
    expect(jobFromDb).not.toBeNull();
    const jobFromDbProps = jobFromDb!.getProps();
    expect(jobFromDbProps.id.value).toBe(createdJobProps.id.value);
    expect(jobFromDbProps.name).toBe(jobName);
    expect(jobFromDbProps.payload).toEqual(jobData);
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
    const createdJobProps = createdJob.getProps();

    expect(createdJobProps.id.value).toBe(validCustomJobId);
    expect(createdJobProps.options.attempts).toBe(5);
    expect(createdJobProps.options.delay).toBe(5000);
    expect(createdJobProps.options.priority).toBe(1);
    expect(createdJobProps.status).toBe(JobStatus.DELAYED);

    const jobFromDb = await jobRepository.findById(createdJobProps.id);
    expect(jobFromDb).not.toBeNull();
    const jobFromDbProps = jobFromDb!.getProps();
    expect(jobFromDbProps.id.value).toBe(validCustomJobId);
    expect(jobFromDbProps.options.priority).toBe(1);
  });
});

describe("QueueService - addBulk", () => {
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

    const job1FromDb = await jobRepository.findById(addedJobs[0].getProps().id);
    expect(job1FromDb).not.toBeNull();
    const job1FromDbProps = job1FromDb!.getProps();
    expect(job1FromDbProps.name).toBe("bulk1");
    expect(job1FromDbProps.payload).toEqual({ email: "b1@example.com" });
    expect(queueService.emit).toHaveBeenCalledWith("job.added", addedJobs[0]);

    const job2FromDb = await jobRepository.findById(addedJobs[1].getProps().id);
    expect(job2FromDb).not.toBeNull();
    const job2FromDbProps = job2FromDb!.getProps();
    expect(job2FromDbProps.name).toBe("bulk2");
    expect(job2FromDbProps.options.priority).toBe(1);
    expect(queueService.emit).toHaveBeenCalledWith("job.added", addedJobs[1]);
  });
});
