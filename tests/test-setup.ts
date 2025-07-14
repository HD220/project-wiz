import path from "path";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeAll as _beforeAll, beforeEach, afterAll } from "vitest";

import { initializeDb } from "../src/main/persistence/db";

let testDb: ReturnType<typeof initializeDb>;

beforeEach(() => {
  testDb = initializeDb(":memory:");
  // setTestDb(testDb); // Removed as it doesn't exist
  migrate(testDb, {
    migrationsFolder: path.resolve(
      __dirname,
      "../src/main/persistence/migrations",
    ),
  });
});

afterAll(() => {
  // Close the database connection if necessary
  // For better-sqlite3, the connection is closed when the process exits or when explicitly closed
});
