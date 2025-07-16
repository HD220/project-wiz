import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { allTables, allRelations } from "./schemas";

export function initializeDb(dbPath: string = "project-wiz.db") {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, {
    schema: {
      ...allTables,
      ...allRelations,
    },
  });
}

export let db = initializeDb();
