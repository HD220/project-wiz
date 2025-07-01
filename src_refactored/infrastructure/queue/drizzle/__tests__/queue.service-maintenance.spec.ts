// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service-maintenance.spec.ts
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
import { DrizzleQueueFacade as QueueService } from "../drizzle-queue.facade";
import { JobProcessingService } from "../job-processing.service";
import { QueueMaintenanceService } from "../queue-maintenance.service";
import { QueueServiceCore } from "../queue-service-core";

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
  const coreService = new QueueServiceCore<{ email: string }, { status: string }>(
    queueName,
    jobRepository,
    defaultJobOpts
  );
  const processingService = new JobProcessingService<{ email: string }, { status: string }>(
    jobRepository,
    coreService, // Use coreService as the EventEmitter
    queueName
  );
  const maintenanceService = new QueueMaintenanceService<{ email: string }, { status: string }>(
    jobRepository,
    coreService, // Use coreService as the EventEmitter
    queueName
  );

  queueService = new QueueService<{ email: string }, { status: string }>(
    queueName,
    jobRepository,
    defaultJobOpts,
    coreService,
    processingService,
    maintenanceService
  );
  vi.spyOn(queueService, "emit");
});

afterEach(async () => {
  if (queueService) {
    await queueService.close();
  }
  vi.restoreAllMocks();
});

describe("QueueService - startMaintenance (Stalled Jobs)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(async () => {
    // Ensure maintenance is stopped and timers are cleared for other test files
    if (queueService && queueService["maintenanceTimer"]) {
      await queueService.stopMaintenance();
    }
    await vi.runAllTimersAsync(); // Process any remaining timers
    vi.useRealTimers();
  });

  it("should periodically check for stalled jobs in DB and handle them", async () => {
    const stalledJob1Id = JobIdVO.create();
    let job1 = JobEntity.create({
      queueName,
      name: "stalled1",
      payload: { email: "s1@ex.com" },
      options: { attempts: 1, jobId: stalledJob1Id.value },
    });
    // Manually set job as active and stalled
    job1.props.status = JobStatus.ACTIVE;
    job1.props.workerId = "stalled-worker";
    job1.props.lockUntil = new Date(Date.now() - 100000); // Lock expired
    job1.props.processedOn = new Date(Date.now() - 100001);
    job1.props.attemptsMade = 1; // Already attempted once
    await jobRepository.save(job1);

    const stalledJob2Id = JobIdVO.create();
    let job2 = JobEntity.create({
      queueName,
      name: "stalled2",
      payload: { email: "s2@ex.com" },
      options: { attempts: 2, jobId: stalledJob2Id.value }, // Allows for one retry
    });
    job2.props.status = JobStatus.ACTIVE;
    job2.props.workerId = "stalled-worker-2";
    job2.props.lockUntil = new Date(Date.now() - 100000); // Lock expired
    job2.props.processedOn = new Date(Date.now() - 100001);
    job2.props.attemptsMade = 1; // First attempt processed, now stalled
    await jobRepository.save(job2);

    queueService.startMaintenance();

    // Allow the first maintenance run
    await vi.advanceTimersByTimeAsync(1); // Ensure current tasks complete
    await vi.advanceTimersByTimeAsync(queueService["maintenanceIntervalMs"]);

    const job1AfterStall = await jobRepository.findById(stalledJob1Id);
    expect(job1AfterStall!.status).toBe(JobStatus.FAILED); // No more attempts
    expect(job1AfterStall!.failedReason).toContain("Stalled");

    const job2AfterStall = await jobRepository.findById(stalledJob2Id);
    expect(job2AfterStall!.status).toBe(JobStatus.WAITING); // Should be re-queued
    expect(job2AfterStall!.stalledCount).toBe(1);
    expect(job2AfterStall!.workerId).toBeNull(); // Lock should be cleared

    const findStalledJobsSpy = vi.spyOn(jobRepository, "findStalledJobs");
    // Advance to next interval
    await vi.advanceTimersByTimeAsync(queueService["maintenanceIntervalMs"] + 1);
    expect(findStalledJobsSpy).toHaveBeenCalledTimes(1); // Should have run again

    // Cleanup for this specific test block
    await queueService.stopMaintenance();
    await vi.runAllTimersAsync();
    findStalledJobsSpy.mockRestore();
  });
});

describe("QueueService - clean", () => {
  it("should call jobRepository.clean and return the count", async () => {
    const gracePeriodMs = 60000;
    const limit = 10;
    const status = JobStatus.COMPLETED;

    // Add a job that will be completed and become old
    const jobToCleanId = JobIdVO.create();
    await queueService.add("job-to-clean", { email: "clean@example.com" }, { jobId: jobToCleanId.value });
    const fetchedJob = await queueService.fetchNextJobAndLock("worker-clean", 1000);
    expect(fetchedJob).not.toBeNull();
    expect(fetchedJob!.id.value).toBe(jobToCleanId.value);

    // Mark as completed
    await queueService.markJobAsCompleted(fetchedJob!.id, "worker-clean", { status: "done" });

    // Manually update its finishedOn to be in the past, beyond grace period
    const jobEntity = await jobRepository.findById(fetchedJob!.id);
    expect(jobEntity).not.toBeNull();
    jobEntity!.props.finishedOn = new Date(Date.now() - gracePeriodMs * 2);
    await jobRepository.update(jobEntity!); // Use repository's update which handles date conversion

    const cleanedCount = await queueService.clean(gracePeriodMs, limit, status);
    expect(cleanedCount).toBe(1);

    const jobAfterClean = await jobRepository.findById(fetchedJob!.id);
    expect(jobAfterClean).toBeNull();
  });
});
