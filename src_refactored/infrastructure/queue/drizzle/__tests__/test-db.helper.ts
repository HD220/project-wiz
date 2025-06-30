import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as jobsSchema from '../../../persistence/drizzle/schema/jobs.schema';

// Combine all schemas that need to be managed by tests
const combinedSchema = {
  ...jobsSchema,
};

export type TestDb = BetterSQLite3Database<typeof combinedSchema>;

export interface TestDbClientOptions {
  memory?: boolean;
  filePath?: string;
}

export function createTestDbClient(options: TestDbClientOptions = { memory: true }): TestDb {
  const sqlite = options.memory ? new Database(':memory:') : new Database(options.filePath!);
  // Enable WAL mode for better concurrency and performance, common for SQLite.
  sqlite.pragma('journal_mode = WAL');
  return drizzle(sqlite, { schema: combinedSchema, logger: false }); // Set logger to true for debugging Drizzle
}

export async function runMigrations(db: TestDb): Promise<void> {
  // This assumes your migrations are in a 'drizzle' folder adjacent to your schema definitions
  // Adjust the path according to your project structure.
  // For example, if schema.ts is in src/db/schema.ts and migrations in src/db/drizzle:
  // await migrate(db, { migrationsFolder: './drizzle' });
  // For now, using a common default. This path needs to be correct.
  // Given the project structure, let's assume migrations are in 'src_refactored/infrastructure/persistence/drizzle/migrations'
  await migrate(db, { migrationsFolder: './src_refactored/infrastructure/persistence/drizzle/migrations' });
}

export async function clearDatabaseTables(db: TestDb): Promise<void> {
  // Careful with this in real scenarios! This is for test isolation.
  // This will delete all data from all known tables in the combined schema.
  // It's generally safer than dropping tables if fk constraints are an issue.
  if (!combinedSchema || typeof combinedSchema !== 'object' || Object.keys(combinedSchema).length === 0) {
    // console.warn('No schema provided or schema is empty. Skipping table clearing.');
    return;
  }

  // We must delete in an order that respects foreign key constraints if they exist and are enforced.
  // For BullMQ-like jobs table, it's usually self-contained or referenced by others.
  // If other tables reference jobs, jobs should be cleared last or references handled.
  // For this example, assuming jobs can be cleared directly.
  // If specific order is needed, list table names explicitly.
  // Example: const tablesToClear = ['notifications', 'user_settings', 'jobs'];

  const tableNames = Object.values(combinedSchema)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((table: any) => table && table._ && typeof table._.name === 'string')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((table: any) => table._.name);

  if (tableNames.length === 0) {
    // console.warn('No table names found in schema. Skipping table clearing.');
    return;
  }

  try {
    // Temporarily disable foreign key constraints to allow arbitrary delete order.
    // This is specific to SQLite. Other DBs have different commands.
    // db.run(sql`PRAGMA foreign_keys = OFF;`); // Not available directly on TestDB type, use .session.run or execute
    (db.session as Database.Database).exec('PRAGMA foreign_keys = OFF;');


    for (const tableName of tableNames) {
      // Drizzle's delete doesn't directly support dynamic table names from a variable in its query builder syntax
      // in a way that's easily type-safe and clean for this generic clear function.
      // We'll use raw SQL for simplicity here, which is common for test cleanup utilities.
      // Ensure table names are sanitized if they could come from untrusted sources (not the case here).
      // console.log(`Clearing table: ${tableName}`);
      // db.run(sql.raw(`DELETE FROM ${tableName};`)); // sql.raw might not be available or work as expected here.
      // Using the underlying better-sqlite3 instance's capabilities:
      (db.session as Database.Database).prepare(`DELETE FROM ${tableName}`).run();
      // Also reset auto-increment counters for SQLite if the table is sqlite_sequence managed
      try {
        (db.session as Database.Database).prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(tableName);
      } catch (_seqError) {
        // Ignore error if table not in sqlite_sequence (e.g., no autoincrement PK or not yet inserted into)
        // console.debug(`Note: Could not reset sequence for ${tableName}, or table not in sqlite_sequence. Error: ${_seqError.message}`);
      }
    }
  } finally {
    // Re-enable foreign key constraints
    (db.session as Database.Database).exec('PRAGMA foreign_keys = ON;');
  }
}

// Example of how to close the underlying SQLite connection if needed,
// though for :memory: databases, it's often not strictly necessary as it's cleaned up when the process/connection object is GC'd.
// export function closeTestDbClient(db: TestDb): void {
//   if (db.session && typeof (db.session as Database.Database).close === 'function') {
//     (db.session as Database.Database).close();
//   }
// }
