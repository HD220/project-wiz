import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

if (!process.env.DB_FILE_NAME) {
  throw new Error('DB_FILE_NAME is not set in .env for better-sqlite3 setup');
}

const sqlite = new Database(process.env.DB_FILE_NAME!);
try {
  sqlite.pragma("journal_mode = WAL");
} catch (e) {
  console.warn("Could not set WAL journal mode for SQLite:", e);
}

export const db = drizzle(sqlite);
