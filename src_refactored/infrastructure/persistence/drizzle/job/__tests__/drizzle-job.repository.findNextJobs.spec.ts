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
    name: "test-job-name",
    payload: { data: "sample" },
    options: { priority: 10, attempts: 1 },
    ...props,
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

describe("findNextJobsToProcess", () => {
  it("should find WAITING jobs ordered by priority then createdAt", async () => {
    const job1 = createTestJob({ options: { priority: 5 } });
    const job2 = createTestJob({ options: { priority: 10 } });
      const job3Delayed = createTestJob({
        options: { priority: 1, delay: 10000 },
      });

      await repository.save(job2);
      await repository.save(job1);
      await repository.save(job3Delayed);

      const nextJobs = await repository.findNextJobsToProcess("test-queue", 3);
      expect(nextJobs.length).toBe(2);
      expect(nextJobs[0].getProps().id.equals(job1.getProps().id)).toBe(true);
      expect(nextJobs[1].getProps().id.equals(job2.getProps().id)).toBe(true);
    });

    it("should find DELAYED jobs whose delayUntil has passed", async () => {
      const pastDelay = new Date(Date.now() - 5000);
      const jobDelayedPast = createTestJob({ options: { delay: 1 } });

      // Modifying props directly for test setup. In real code, use entity methods.
      const mutableProps = jobDelayedPast.getProps() as JobEntityProps<TestJobPayload, TestJobResult>;
      mutableProps.createdAt = new Date(Date.now() - 10000);
      mutableProps.delayUntil = pastDelay;
      mutableProps.status = JobStatus.DELAYED;
      // Note: This direct props modification is for test setup expediency.
      // In a real scenario, an entity method should handle such state changes if valid.
      await repository.save(jobDelayedPast); // save will use the current state of jobDelayedPast.getProps()

      const nextJobs = await repository.findNextJobsToProcess("test-queue", 1);
      expect(nextJobs.length).toBe(1);
      expect(nextJobs[0].getProps().id.equals(jobDelayedPast.getProps().id)).toBe(true);
    });
  });
