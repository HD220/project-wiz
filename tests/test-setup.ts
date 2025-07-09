import { beforeAll, beforeEach, afterAll } from 'vitest';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { initializeDb, setTestDb } from '../src/main/persistence/db';
import path from 'path';

let testDb: ReturnType<typeof initializeDb>;

beforeEach(() => {
  testDb = initializeDb(':memory:');
  setTestDb(testDb);
  migrate(testDb, { migrationsFolder: path.resolve(__dirname, '../src/main/persistence/migrations') });
});

afterAll(() => {
  // Close the database connection if necessary
  // For better-sqlite3, the connection is closed when the process exits or when explicitly closed
});
