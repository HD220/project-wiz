import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from 'path'; // Added

if (!process.env.DB_FILE_NAME) {
  throw new Error('DB_FILE_NAME is not set in .env for better-sqlite3 setup');
}

const sqlite = new Database(process.env.DB_FILE_NAME!);

// Load sqlite-vec extension
try {
  const extensionPath = path.join(process.cwd(), 'sqlite_extensions', 'vec'); // Base name, OS adds .dll, .so, .dylib
  sqlite.loadExtension(extensionPath);
  console.log('Successfully loaded sqlite-vec extension.');
} catch (e: any) {
  console.error('Failed to load sqlite-vec extension. Semantic search in MemoryTool will not work effectively.', e.message);
  // Depending on how critical this is, you might rethrow or allow app to continue with limited functionality.
  // For now, log error and continue.
}

try {
  sqlite.pragma("journal_mode = WAL");
} catch (e) {
  console.warn("Could not set WAL journal mode for SQLite:", e);
}

export const db = drizzle(sqlite);
