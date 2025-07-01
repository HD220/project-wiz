import BetterSqlite3 from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";

import { JobEntity } from "@/core/domain/job/job.entity";
// import { JobEntityProps } from "@/core/domain/job/job.types"; // JobStatus not needed here

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

describe("update", () => {
  it("should update an existing job properties", async () => {
    const job = createTestJob();
    await repository.save(job);

    job.updateProgress(75); // Method call
    job.addLog("Update log"); // Method call
    await repository.update(job);

    const updatedJob = await repository.findById(job.getProps().id);
    expect(updatedJob).not.toBeNull();
    const updatedJobProps = updatedJob!.getProps();
    expect(updatedJobProps.progress).toBe(75);
    expect(updatedJobProps.logs.length).toBe(1);
    expect(updatedJobProps.logs[0].message).toBe("Update log");
  });
});
