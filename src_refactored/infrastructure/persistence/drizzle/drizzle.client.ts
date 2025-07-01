import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

const dbFileName = process.env.DB_FILE_NAME || "data/app-queue.sqlite3";
const dbFilePath = path.resolve(dbFileName);

const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`[DrizzleClient] Created database directory: ${dbDir}`);
}

console.log(`[DrizzleClient] Connecting to SQLite database at: ${dbFilePath}`);
const sqlite = new Database(dbFilePath);

sqlite.pragma("journal_mode = WAL");
console.log("[DrizzleClient] WAL mode enabled.");

export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, {
  schema,
});

try {
  console.log("[DrizzleClient] Running migrations...");
  const migrationsFolder = path.resolve(
    process.cwd(),
    "src_refactored/infrastructure/persistence/drizzle/migrations"
  );

  migrate(db, { migrationsFolder });
  console.log("[DrizzleClient] Migrations applied successfully.");
} catch (error) {
  console.error("[DrizzleClient] Error applying migrations:", error);
}

console.log("[DrizzleClient] Drizzle client with better-sqlite3 initialized.");

export { schema };
