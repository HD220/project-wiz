// src_refactored/infrastructure/queue/drizzle/__tests__/queue.service.spec.ts
// Main test file for QueueService.
// Tests have been split into multiple files for better organization and to manage file length.
// See:
// - queue.service-add.spec.ts
// - queue.service-get.spec.ts
// - queue.service-lifecycle.spec.ts
// - queue.service-updates.spec.ts
// - queue.service-maintenance.spec.ts
// - queue.service-admin.spec.ts

import {
  vi,
  // describe, // No top-level describe needed here anymore
  // it,
  // expect,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";

// import { JobEntity, JobStatus } from "../../../../core/domain/job/job.entity"; // Keep if needed by shared setup
// import { JobIdVO } from "../../../../core/domain/job/value-objects/job-id.vo"; // Keep if needed by shared setup
import { type IJobOptions } from "../../../../core/domain/job/value-objects/job-options.vo";
import { DrizzleJobRepository } from "../../../persistence/drizzle/job/drizzle-job.repository";
import { DrizzleQueueFacade as QueueService } from "../drizzle-queue.facade";

import {
  TestDb,
  createTestDbClient,
  runMigrations,
  clearDatabaseTables,
} from "./test-db.helper";

// Top-level variables for test context, potentially used by split files if they import this setup.
// However, each spec file currently re-declares this setup.
// This file can be minimal if setup is fully duplicated, or it could export setup helpers.
export let db: TestDb;
export let jobRepository: DrizzleJobRepository;
export let queueService: QueueService<{ email: string }, { status: string }>;
export const queueName = "test-email-queue";
export const defaultJobOpts: IJobOptions = {
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
  // Initialize repository and service here if they are to be shared and imported by other spec files.
  // For now, each spec file initializes its own.
});

beforeEach(async () => {
  vi.clearAllMocks();
  await clearDatabaseTables(db); // Clears for all tests using this shared db connection.

  // If we intend split files to use a shared `queueService` instance, initialize it here.
  // Otherwise, this beforeEach is only for this file (which has no tests directly).
  // jobRepository = new DrizzleJobRepository(db);
  // queueService = new QueueService(queueName, jobRepository, defaultJobOpts);
  // vi.spyOn(queueService, "emit"); // This would need to be handled carefully if service is per-file.
});

afterEach(async () => {
  // if (queueService) { // If service is shared
  //   await queueService.close();
  // }
  vi.restoreAllMocks();
});

// No direct tests in this file anymore. All tests are in specific queue.service-*.spec.ts files.
