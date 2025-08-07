import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Logger } from "drizzle-orm/logger";

import { getDatabaseConfig } from "@/shared/config/index";
import { getLogger } from "@/shared/services/logger/config";

/**
 * Shared DrizzleLogger that integrates with our centralized Pino logger
 * Used by both main and worker processes for consistent database logging
 */
export class SharedDrizzleLogger implements Logger {
  private logger = getLogger("database");

  logQuery(query: string, params: unknown[]): void {
    this.logger.debug("Database query executed", {
      query,
      params,
      type: "query",
    });
  }
}

/**
 * Create a SQLite database instance with shared configuration
 * This function ensures both main and worker processes use identical settings
 */
export function createSqliteInstance(): Database.Database {
  const config = getDatabaseConfig();

  // Initialize SQLite database
  const sqlite = new Database(config.dbPath);

  // Apply shared pragma settings
  if (config.enableWal) {
    sqlite.pragma("journal_mode = WAL");
  }

  if (config.enableForeignKeys) {
    sqlite.pragma("foreign_keys = ON");
  }

  return sqlite;
}

/**
 * Create a Drizzle database instance with shared configuration
 * @param sqlite - Optional SQLite instance, creates new one if not provided
 * @param enableDrizzleLogging - Whether to enable Drizzle query logging (default: true)
 */
export function createDrizzleInstance(
  sqlite?: Database.Database,
  enableDrizzleLogging: boolean = true,
) {
  const sqliteInstance = sqlite || createSqliteInstance();

  const options = enableDrizzleLogging
    ? { logger: new SharedDrizzleLogger() }
    : {};

  return drizzle(sqliteInstance, options);
}

/**
 * Database factory function that creates both SQLite and Drizzle instances
 * Returns the same interface as existing database connection files
 */
export function createDatabaseConnection(enableDrizzleLogging: boolean = true) {
  const sqlite = createSqliteInstance();
  const db = createDrizzleInstance(sqlite, enableDrizzleLogging);

  return {
    db,
    sqlite,
    getDatabase: () => db,
  };
}

// Type exports for compatibility
export type DatabaseType = ReturnType<typeof createDrizzleInstance>;
export type SqliteType = Database.Database;
