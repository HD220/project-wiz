import { randomUUID } from "crypto";
import {
  text,
  integer,
  index,
  primaryKey,
  sqliteTable,
} from "drizzle-orm/sqlite-core";
import { queues } from "./queues";
import { JobStatusValues } from "@/core/domain/entities/jobs/job-status";
import { Placeholder, SQL } from "drizzle-orm";

const enumValues = <T extends Record<string, string>>(obj: T) => {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]];
};

export const JobStatusEnum = enumValues(JobStatusValues);

export type JobStatusEnumType =
  | (typeof JobStatusEnum)[number]
  | SQL<unknown>
  | Placeholder<string, any>;

export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => randomUUID()),
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    data: text("data", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    opts: text("opts", { mode: "json" })
      .$type<{ priority: number; delay: number } & Record<string, unknown>>()
      .notNull(),
    status: text("status", {
      enum: JobStatusEnum,
    }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    startedAt: integer("started_at", { mode: "timestamp" }),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
    failedReason: text("failed_reason"),
    delayedUntil: integer("delayed_until", { mode: "timestamp" }),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.queueId] }),
    index("queue_status_idx").on(table.queueId, table.status),
  ]
);

export type JobsInsert = typeof jobs.$inferInsert;
export type JobsUpdate = Required<
  Pick<typeof jobs.$inferInsert, "id" | "queueId">
> &
  Partial<Omit<typeof jobs.$inferInsert, "id" | "queueId">>;
export type JobsSelect = typeof jobs.$inferSelect;
export type JobsDelete = Required<
  Pick<typeof jobs.$inferInsert, "id" | "queueId">
>;
