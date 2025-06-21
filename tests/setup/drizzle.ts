import betterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

export async function setupTestDB() {
  const sqlite = new betterSqlite3(":memory:");
  const db = drizzle(sqlite);

  // Criar tabelas manualmente na ordem correta
  await sqlite.exec(`
    PRAGMA foreign_keys=OFF;
    BEGIN TRANSACTION;
    
    CREATE TABLE queues (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      concurrency integer DEFAULT 1 NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    );
    
    CREATE TABLE jobs (
      id text NOT NULL,
      queue_id text NOT NULL,
      name text NOT NULL,
      data text NOT NULL,
      opts text NOT NULL,
      status text NOT NULL,
      updated_at integer NOT NULL,
      started_at integer DEFAULT NULL,
      finished_at integer DEFAULT NULL,
      failed_reason text DEFAULT NULL,
      delayed_until integer DEFAULT NULL,
      PRIMARY KEY(id, queue_id),
      FOREIGN KEY (queue_id) REFERENCES queues(id) ON UPDATE cascade ON DELETE cascade
    );
    
    COMMIT;
    PRAGMA foreign_keys=ON;
  `);

  return {
    db,
    sqlite,
    close: () => sqlite.close(),
  };
}

export async function teardownTestDB(dbInstance: {
  sqlite?: { close: () => void };
}) {
  try {
    if (dbInstance?.sqlite?.close) {
      dbInstance.sqlite.close();
    }
  } catch (error) {
    console.error("Error during database teardown:", error);
  }
}
