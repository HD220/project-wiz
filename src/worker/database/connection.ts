import path from "path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// Database file path - same as main process
const DB_PATH = process.env["DB_FILE_NAME"] || "./project-wiz.db";
const dbPath = path.resolve(DB_PATH);

// Initialize SQLite database
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");

// Enable foreign key constraints
sqlite.pragma("foreign_keys = ON");

// Create Drizzle database instance without schema option (as specified)
// Worker only accesses job queue tables, no need for full schema
export const db = drizzle(sqlite);

export type DatabaseType = typeof db;

// Export sqlite instance for direct access if needed
export { sqlite };

// Utility function to get database instance
export function getDatabase(): typeof db {
  return db;
}