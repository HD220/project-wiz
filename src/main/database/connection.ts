import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema-consolidated";
import path from "path";

// Database file path
const DB_PATH = process.env["DB_FILE_NAME"] || "./project-wiz.db";
const dbPath = path.resolve(DB_PATH);

// Initialize SQLite database
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");

// Enable foreign key constraints
sqlite.pragma("foreign_keys = ON");

// Create Drizzle database instance
export const db = drizzle(sqlite, { schema });

export type DatabaseType = typeof db;

// Export sqlite instance for direct access if needed
export { sqlite };

// Utility function to get database instance
export function getDatabase(): typeof db {
  return db;
}
