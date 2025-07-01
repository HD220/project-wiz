import BetterSqlite3 from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobEntityProps } from "@/core/domain/job/job.types";

import * as schema from "../../schema";
import { DrizzleJobRepository } from "../drizzle-job.repository";

// Define more specific types for payload and result for these tests
interface TestJobPayload {
  data?: string;
  order?: number;
  newData?: string;
  name?: string; // Added name to TestJobPayload for createTestJob
  [key: string]: unknown;
}
interface TestJobResult {
  [key: string]: unknown;
}

// Helper function to create a job entity for tests
const createTestJob = (
  props: Partial<
    Parameters<typeof JobEntity.create<TestJobPayload, TestJobResult>>[0]
  > = {}
): JobEntity<TestJobPayload, TestJobResult> => {
  return JobEntity.create<TestJobPayload, TestJobResult>({
    queueName: "test-queue",
    name: props.name || "test-job-name", // Use provided name or default
    payload: { data: "sample", ...props.payload }, // Spread payload
    options: { priority: 10, attempts: 1, ...props.options }, // Spread options
    ...props, // Spread other top-level props like id
  });
};

// Variables for shared test context
let testDb: BetterSQLite3Database<typeof schema>;
let sqliteInstance: BetterSqlite3.Database;
let repository: DrizzleJobRepository;

beforeAll(() => {
  sqliteInstance = new BetterSqlite3(":memory:");
  testDb = drizzle(sqliteInstance, { schema });
  migrate(testDb, {
    migrationsFolder:
      "./src_refactored/infrastructure/persistence/drizzle/migrations",
  });
});

afterAll(() => {
  sqliteInstance.close();
});

beforeEach(async () => {
  // Ensure repository is new for each test, and tables are clean
  repository = new DrizzleJobRepository(testDb);
  await testDb.delete(schema.jobsTable);
});

describe("clean", () => {
  it("should clean old completed jobs respecting limit and grace period", async () => {
    const veryOldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const recentDate = new Date(Date.now() - 10 * 60 * 1000);

    const jobOld = createTestJob({ name: "old" });
    jobOld.moveToActive("w", new Date()); // Method call
    jobOld.markAsCompleted({}); // Method call
    (jobOld.getProps() as JobEntityProps<TestJobPayload, TestJobResult>).finishedOn = veryOldDate;
    await repository.save(jobOld);

    const jobRecent = createTestJob({ name: "recent" });
    jobRecent.moveToActive("w", new Date()); // Method call
    jobRecent.markAsCompleted({}); // Method call
    (jobRecent.getProps() as JobEntityProps<TestJobPayload, TestJobResult>).finishedOn = recentDate;
    await repository.save(jobRecent);

    const jobFailedOld = createTestJob({ name: "failedOld" });
    jobFailedOld.moveToActive("w", new Date()); // Method call
    jobFailedOld.markAsFailed("err"); // Method call
    (jobFailedOld.getProps() as JobEntityProps<TestJobPayload, TestJobResult>).finishedOn = veryOldDate;
    await repository.save(jobFailedOld);

    const cleanedCount = await repository.clean(
      "test-queue",
      24 * 60 * 60 * 1000,
      1,
      JobStatus.COMPLETED
    );
    expect(cleanedCount).toBe(1);

    const foundOld = await repository.findById(jobOld.getProps().id);
    expect(foundOld).toBeNull();
    const foundRecent = await repository.findById(jobRecent.getProps().id);
    expect(foundRecent).not.toBeNull();
    const foundFailedOld = await repository.findById(jobFailedOld.getProps().id);
    expect(foundFailedOld).not.toBeNull();
  });

  it("should clean old completed or failed jobs if status is not specified", async () => {
    const oldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const jobCompletedOld = createTestJob({ name: "c-old" });
    jobCompletedOld.moveToActive("w", new Date()); // Method call
    jobCompletedOld.markAsCompleted({}); // Method call
    (jobCompletedOld.getProps() as JobEntityProps<TestJobPayload, TestJobResult>).finishedOn = oldDate;
    await repository.save(jobCompletedOld);

    const jobFailedOld = createTestJob({ name: "f-old" });
    jobFailedOld.moveToActive("w", new Date()); // Method call
    jobFailedOld.markAsFailed("err"); // Method call
    (jobFailedOld.getProps() as JobEntityProps<TestJobPayload, TestJobResult>).finishedOn = oldDate;
    await repository.save(jobFailedOld);

    const jobWaiting = createTestJob({ name: "w-old" });
    // Modifying props directly for test setup
    const mutableWaitingProps = jobWaiting.getProps() as JobEntityProps<TestJobPayload, TestJobResult>;
    mutableWaitingProps.createdAt = oldDate;
    mutableWaitingProps.finishedOn = undefined;
    await repository.save(jobWaiting);

    const cleanedCount = await repository.clean(
      "test-queue",
      24 * 60 * 60 * 1000,
      5
    );
    expect(cleanedCount).toBe(2);

    expect(await repository.findById(jobCompletedOld.getProps().id)).toBeNull();
    expect(await repository.findById(jobFailedOld.getProps().id)).toBeNull();
    expect(await repository.findById(jobWaiting.getProps().id)).not.toBeNull();
  });
});
