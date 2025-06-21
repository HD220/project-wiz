import {
  sqliteTable,
  text,
  integer,
  blob,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  payload: blob("payload", { mode: "json" }).notNull(),
  data: blob("data", { mode: "json" }),
  result: blob("result", { mode: "json" }),
  status: text("status").notNull(),
  depends_on: blob("depends_on", { mode: "json" }).notNull().$type<string[]>(),
  max_attempts: integer("max_attempts").notNull(),
  attempts: integer("attempts").notNull(),
  priority: integer("priority").notNull(),
  delay: integer("delay").notNull(),
  max_retry_delay: integer("max_retry_delay").notNull(),
  retry_delay: integer("retry_delay").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull(),
});
