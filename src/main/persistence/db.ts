import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

export function initializeDb(dbPath: string = "project-wiz.db") {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

export let db = initializeDb();

export function setTestDb(testDbInstance: ReturnType<typeof initializeDb>) {
  db = testDbInstance;
}
