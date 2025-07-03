import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

const MIGRATIONS_PATH =
  "./src_refactored/infrastructure/persistence/drizzle/migrations";

export function setupTestDatabase() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: MIGRATIONS_PATH });

  return { db, sqlite };
}

export async function clearDatabase(
  db: ReturnType<typeof drizzle>,
  _sqliteInstance: typeof Database
) {
  await db.delete(schema.jobsTable).execute();
}

export function closeTestDatabase(sqliteInstance: Database) {
  sqliteInstance.close();
}
