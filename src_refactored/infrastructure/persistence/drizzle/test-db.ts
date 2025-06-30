import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from './schema'; // To access all tables for clearing

// Path to migrations, assuming vitest runs from project root or similar
// Adjust if tests are run from a different working directory.
const MIGRATIONS_PATH = './src_refactored/infrastructure/persistence/drizzle/migrations';

export function setupTestDatabase() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });

  // Apply migrations
  migrate(db, { migrationsFolder: MIGRATIONS_PATH });

  return { db, sqlite };
}

export async function clearDatabase(db: ReturnType<typeof drizzle>, _sqliteInstance: Database) {
  // Simple way to clear: close and reopen in-memory DB, or drop tables.
  // For SQLite in-memory, closing and reopening is cleanest if state needs full reset.
  // Alternatively, delete from all known tables.

  // For now, let's delete from known tables. This list might need to grow if more tables are added.
  // Order matters if there are foreign key constraints, but for jobsTable it's standalone.
  await db.delete(schema.jobsTable).execute();
  // If repeatableJobSchedulesTable was active, would need:
  // await db.delete(schema.repeatableJobSchedulesTable).execute();
}

// Utility to close the database connection, useful in afterAll hooks
export function closeTestDatabase(sqliteInstance: Database) {
  sqliteInstance.close();
}
