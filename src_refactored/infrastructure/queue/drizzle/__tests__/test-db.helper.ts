import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as jobsSchema from "../../../persistence/drizzle/schema/jobs.schema";

const combinedSchema = {
  ...jobsSchema,
};

export type TestDb = BetterSQLite3Database<typeof combinedSchema>;

export interface TestDbClientOptions {
  memory?: boolean;
  filePath?: string;
}

export function createTestDbClient(
  options: TestDbClientOptions = { memory: true }
): TestDb {
  const sqlite = options.memory
    ? new Database(":memory:")
    : new Database(options.filePath!);
  // Enable WAL mode for better concurrency and performance, common for SQLite.
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema: combinedSchema, logger: false });
}

export async function runMigrations(db: TestDb): Promise<void> {
  await migrate(db, {
    migrationsFolder:
      "./src_refactored/infrastructure/persistence/drizzle/migrations",
  });
}

export async function clearDatabaseTables(db: TestDb): Promise<void> {
  if (
    !combinedSchema ||
    typeof combinedSchema !== "object" ||
    Object.keys(combinedSchema).length === 0
  ) {
    return;
  }

  const tableNames = Object.values(combinedSchema)
    .filter(
      (table: unknown) => table && table._ && typeof table._.name === "string"
    )
    .map((table: unknown) => table._.name);

  if (tableNames.length === 0) {
    return;
  }

  try {
    (db.session as Database.Database).exec("PRAGMA foreign_keys = OFF;");

    for (const tableName of tableNames) {
      (db.session as Database.Database)
        .prepare(`DELETE FROM ${tableName}`)
        .run();
      try {
        (db.session as Database.Database)
          .prepare(`DELETE FROM sqlite_sequence WHERE name = ?`)
          .run(tableName);
      } catch (_seqError) {
        // console.debug(`Note: Could not reset sequence for ${tableName}, or table not in sqlite_sequence. Error: ${_seqError.message}`);
      }
    }
  } finally {
    (db.session as Database.Database).exec("PRAGMA foreign_keys = ON;");
  }
}
