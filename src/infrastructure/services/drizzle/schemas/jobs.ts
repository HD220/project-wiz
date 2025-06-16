import { randomUUID } from "crypto";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const jobStatus = [
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed",
] as const;

export const jobs = sqliteTable("jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  data: text("data", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  opts: text("opts", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  status: text("status", { enum: jobStatus }).notNull(),
  priority: integer("priority").notNull(),
  delay: integer("delay").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  startedAt: integer("started_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  finishedAt: integer("finished_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  failedReason: text("failed_reason"),
});

export type JobsInsert = typeof jobs.$inferInsert;
export type JobsUpdate = Required<Pick<typeof jobs.$inferInsert, "id">> &
  Partial<Omit<typeof jobs.$inferInsert, "id">>;
export type JobsSelect = typeof jobs.$inferSelect;
export type JobsDelete = Required<Pick<typeof jobs.$inferInsert, "id">>;
