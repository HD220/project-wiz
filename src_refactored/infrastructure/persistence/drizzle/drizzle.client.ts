// src_refactored/infrastructure/persistence/drizzle/drizzle.client.ts
import fs from 'node:fs'; // For ensuring DB directory exists
import path from 'node:path'; // For resolving migrations path

import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from './schema'; // Import all tables from the schema index


// Ensure DB_FILE_NAME is set, provide a default for local dev if not set
const dbFileName = process.env.DB_FILE_NAME || 'data/app-queue.sqlite3';
const dbFilePath = path.resolve(dbFileName);

// Ensure the directory for the SQLite file exists
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`[DrizzleClient] Created database directory: ${dbDir}`);
}

console.log(`[DrizzleClient] Connecting to SQLite database at: ${dbFilePath}`);
const sqlite = new Database(dbFilePath); // verbose: console.log for debugging

// Enable WAL mode for better concurrency, if not already enabled.
// This pragma should be executed on each connection if not persisted in the DB file itself.
sqlite.pragma('journal_mode = WAL');
console.log('[DrizzleClient] WAL mode enabled.');

export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema });

// Migration logic
try {
  console.log('[DrizzleClient] Running migrations...');
    const migrationsFolder = path.resolve(process.cwd(), 'src_refactored/infrastructure/persistence/drizzle/migrations');
  // Note: __dirname might behave differently based on ES Modules vs CommonJS and bundlers.
  // A more robust path might be needed if bundling affects __dirname.
  // For Electron, __dirname usually points to the current file's directory in the packaged app.
  // If this script runs from its original location during development, this should be fine.
  // Alternative for migrations path if issues arise:
  // const migrationsFolder = path.resolve(process.cwd(), 'src_refactored/infrastructure/persistence/drizzle/migrations');

  migrate(db, { migrationsFolder });
  console.log('[DrizzleClient] Migrations applied successfully.');
} catch (error) {
  console.error('[DrizzleClient] Error applying migrations:', error);
  // Depending on the error, you might want to exit the app or handle it gracefully.
  // For critical migration failures, exiting might be safer.
  // process.exit(1);
}

console.log('[DrizzleClient] Drizzle client with better-sqlite3 initialized.');

// Export the schema for use in repositories or other parts of the infrastructure layer
export { schema };
