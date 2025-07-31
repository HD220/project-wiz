import path from "path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Logger } from "drizzle-orm/logger";

import { getLogger } from "../utils/logger";

// Database file path
const DB_PATH = process.env["DB_FILE_NAME"] || "./project-wiz.db";
const dbPath = path.resolve(DB_PATH);

// Initialize SQLite database
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");

// Enable foreign key constraints
sqlite.pragma("foreign_keys = ON");

// Custom Drizzle logger that integrates with our Pino logger
class DrizzleLogger implements Logger {
  private logger = getLogger("database");

  logQuery(query: string, params: unknown[]): void {
    this.logger.debug(
      {
        query,
        params,
        type: "query",
      },
      "Database query executed",
    );
  }
}

// Create Drizzle database instance with logging
export const db = drizzle(sqlite, { logger: new DrizzleLogger() });

export type DatabaseType = typeof db;

// Export sqlite instance for direct access if needed
export { sqlite };

// Utility function to get database instance
export function getDatabase(): typeof db {
  return db;
}
