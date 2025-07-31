import path from "path";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeAll as _beforeAll, beforeEach, afterAll } from "vitest";

import { getDatabase } from "../src/main/database/connection";

let testDb: ReturnType<typeof getDatabase>;

beforeEach(() => {
  testDb = getDatabase();
  migrate(testDb, {
    migrationsFolder: path.resolve(
      __dirname,
      "../src/main/database/migrations",
    ),
  });
});

afterAll(() => {
  // Close the database connection if necessary
  // For better-sqlite3, the connection is closed when the process exits or when explicitly closed
});
