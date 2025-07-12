import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

export function initializeDb(dbPath: string = "project-wiz.db") {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite);
}

export let db = initializeDb();
