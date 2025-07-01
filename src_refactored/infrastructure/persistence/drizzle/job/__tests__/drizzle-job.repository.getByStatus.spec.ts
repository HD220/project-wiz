import BetterSqlite3 from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
// import { JobEntityProps } from "@/core/domain/job/job.types"; // Not used

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

describe("getJobsByStatus", () => {
  it("should retrieve jobs by specified statuses with pagination and ordering", async () => {
    const jobW1 = createTestJob({ payload: { order: 1 } });
    const jobW2 = createTestJob({ payload: { order: 2 } });
    const jobA1 = createTestJob({ payload: { order: 3 } });
    jobA1.moveToActive("w1", new Date(Date.now() + 1000)); // Method call

    await repository.save(jobW1);
    await repository.save(jobA1);
    await repository.save(jobW2);

    const waitingJobs = await repository.getJobsByStatus(
      "test-queue",
      [JobStatus.WAITING],
      0,
      10,
      true
    ); // asc
    expect(waitingJobs.length).toBe(2);
    expect(waitingJobs[0].getProps().id.equals(jobW1.getProps().id)).toBe(true);
    expect(waitingJobs[1].getProps().id.equals(jobW2.getProps().id)).toBe(true);

    const activeJobs = await repository.getJobsByStatus(
      "test-queue",
      [JobStatus.ACTIVE],
      0,
      1
    );
    expect(activeJobs.length).toBe(1);
    expect(activeJobs[0].getProps().id.equals(jobA1.getProps().id)).toBe(true);
  });
});
