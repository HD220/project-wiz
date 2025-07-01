import BetterSqlite3 from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
// import { JobEntityProps } from "@/core/domain/job/job.types"; // Not needed

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

describe("countJobsByStatus", () => {
  it("should count jobs by their status", async () => {
    await repository.save(createTestJob()); // job 1: waiting
    const activeJob = createTestJob();      // job 2: initially waiting
    await repository.save(activeJob);       // save job 2 as waiting
    activeJob.moveToActive("w1", new Date(Date.now() + 1000)); // job 2: active
    await repository.update(activeJob);     // update job 2 to active in DB

    const counts = await repository.countJobsByStatus("test-queue");
    // Expect one waiting (job 1) and one active (job 2)
    expect(counts[JobStatus.WAITING]).toBe(1);
    expect(counts[JobStatus.ACTIVE]).toBe(1);
    expect(counts[JobStatus.COMPLETED]).toBeUndefined();
  });
});
