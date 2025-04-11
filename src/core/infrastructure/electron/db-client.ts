import path from "path";
import { app } from "electron";
import * as schema from "../db/schema";

const dbPath = path.join(app.getPath("userData"), "project-wiz.db");

export async function createDatabase() {
  try {
    const { default: Database } = await import("better-sqlite3");
    const { drizzle } = await import("drizzle-orm/better-sqlite3");

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");

    return drizzle(sqlite, { schema });
  } catch (error) {
    console.error("Failed to load better-sqlite3 or drizzle-orm/better-sqlite3:", error);
    throw new Error("Database modules not available. Please ensure better-sqlite3 and drizzle-orm/better-sqlite3 are installed in your environment.");
  }
}

export const dbPromise = createDatabase();