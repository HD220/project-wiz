import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Logger } from "drizzle-orm/logger";
import * as sqliteVec from "sqlite-vec";

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
 * @param enableVectorExtension - Whether to load sqlite-vec extension (default: false)
 */
export function createSqliteInstance(
  enableVectorExtension: boolean = false,
): Database.Database {
  const config = getDatabaseConfig();

  // Initialize SQLite database
  const sqlite = new Database(config.dbPath);

  // Load sqlite-vec extension if requested (BEFORE other configurations)
  if (enableVectorExtension) {
    try {
      sqliteVec.load(sqlite);
      getLogger("database").info("sqlite-vec extension loaded successfully");
    } catch (error) {
      getLogger("database").warn("Failed to load sqlite-vec extension:", error);
      // Continue without vector support - don't throw error
    }
  }

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
 * @param enableVectorExtension - Whether to load sqlite-vec extension if creating new instance (default: false)
 */
export function createDrizzleInstance(
  sqlite?: Database.Database,
  enableDrizzleLogging: boolean = true,
  enableVectorExtension: boolean = false,
) {
  const sqliteInstance = sqlite || createSqliteInstance(enableVectorExtension);

  const options = enableDrizzleLogging
    ? { logger: new SharedDrizzleLogger() }
    : {};

  return drizzle(sqliteInstance, options);
}

/**
 * Database factory function that creates both SQLite and Drizzle instances
 * Returns the same interface as existing database connection files
 * @param enableDrizzleLogging - Whether to enable Drizzle query logging (default: true)
 * @param enableVectorExtension - Whether to load sqlite-vec extension (default: false)
 */
export function createDatabaseConnection(
  enableDrizzleLogging: boolean = true,
  enableVectorExtension: boolean = false,
) {
  const sqlite = createSqliteInstance(enableVectorExtension);
  const db = createDrizzleInstance(
    sqlite,
    enableDrizzleLogging,
    enableVectorExtension,
  );

  return {
    db,
    sqlite,
    getDatabase: () => db,
  };
}

// Type exports for compatibility
export type DatabaseType = ReturnType<typeof createDrizzleInstance>;
export type SqliteType = Database.Database;
