import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const queues = sqliteTable("queues", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").unique().notNull(),
  concurrency: integer("concurrency").default(1).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type QueuesInsert = typeof queues.$inferInsert;
export type QueuesUpdate = Required<Pick<typeof queues.$inferInsert, "id">> &
  Partial<Omit<typeof queues.$inferInsert, "id">>;
export type QueuesSelect = typeof queues.$inferSelect;
export type QueuesDelete = Required<Pick<typeof queues.$inferInsert, "id">>;
