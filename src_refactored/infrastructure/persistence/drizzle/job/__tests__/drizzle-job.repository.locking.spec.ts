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

describe("acquireLock and extendLock", () => {
  it("should acquire a lock for an available job", async () => {
    const job = createTestJob();
    await repository.save(job);

    const workerId = "worker-1";
    const lockUntil = new Date(Date.now() + 30000);
    const locked = await repository.acquireLock(job.getProps().id, workerId, lockUntil);
    expect(locked).toBe(true);

    const lockedJob = await repository.findById(job.getProps().id);
    expect(lockedJob).not.toBeNull();
    const lockedJobProps = lockedJob!.getProps();
    expect(lockedJobProps.status).toBe(JobStatus.ACTIVE);
    expect(lockedJobProps.workerId).toBe(workerId);
    expect(lockedJobProps.lockUntil!.getTime()).toBeCloseTo(lockUntil.getTime());
  });

  it("should not acquire a lock if job is already locked by another worker", async () => {
    const job = createTestJob();
    await repository.save(job);
    await repository.acquireLock(
      job.getProps().id,
      "worker-1",
      new Date(Date.now() + 30000)
    );

    const lockedByOther = await repository.acquireLock(
      job.getProps().id,
      "worker-2",
      new Date(Date.now() + 30000)
    );
    expect(lockedByOther).toBe(false);
  });

  it("should acquire a lock if existing lock has expired", async () => {
    const job = createTestJob();
    await repository.save(job);
    await repository.acquireLock(
      job.getProps().id,
      "worker-1",
      new Date(Date.now() - 1000)
    );

    const acquired = await repository.acquireLock(
      job.getProps().id,
      "worker-2",
      new Date(Date.now() + 30000)
    );
    expect(acquired).toBe(true);
    const lockedJob = await repository.findById(job.getProps().id);
    expect(lockedJob).not.toBeNull();
    expect(lockedJob!.getProps().workerId).toBe("worker-2");
  });

  it("should extend an existing lock", async () => {
    const job = createTestJob();
    await repository.save(job);
    const workerId = "worker-1";
    await repository.acquireLock(
      job.getProps().id,
      workerId,
      new Date(Date.now() + 10000)
    );

    const newLockUntil = new Date(Date.now() + 60000);
    await repository.extendLock(job.getProps().id, workerId, newLockUntil);

    const extendedLockJob = await repository.findById(job.getProps().id);
    expect(extendedLockJob).not.toBeNull();
    expect(extendedLockJob!.getProps().lockUntil!.getTime()).toBeCloseTo(
      newLockUntil.getTime()
    );
  });
});
