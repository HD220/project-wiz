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
import { Placeholder, SQL, sql } from "drizzle-orm";

const enumValues = <T extends Record<string, string>>(obj: T) => {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]];
};

export const JobStatusEnum = enumValues(JobStatusValues);

export type JobStatusEnumType =
  | (typeof JobStatusEnum)[number]
  | SQL<unknown>
  | Placeholder<string, any>;

/**
 * Schema de jobs com estratégia de ordenação e índices otimizados:
 * - Prioridade: numérica (1-10), sendo 10 a mais alta
 * - Ordem padrão:
 *   1. Prioridade (decrescente)
 *   2. Timestamp updatedAt (crescente) para FIFO em mesma prioridade
 * - Índices compostos para queries frequentes:
 *   - Busca por queue + status + prioridade
 *   - Busca por status + updatedAt (jobs ativos)
 *   - Busca por delayedUntil + status (jobs agendados)
 *   - Busca por startedAt + status (jobs em execução)
 */
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
    startedAt: integer("started_at", { mode: "timestamp" })
      .$type<Date | null>()
      .default(null)
      .$onUpdateFn(() => new Date()),
    finishedAt: integer("finished_at", { mode: "timestamp" })
      .$type<Date | null>()
      .default(null),
    failedReason: text("failed_reason").$type<string | null>().default(null),
    delayedUntil: integer("delayed_until", { mode: "timestamp" })
      .$type<Date | null>()
      .default(null),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.queueId] }),
    index("queue_status_idx").on(table.queueId, table.status),
    index("queue_status_priority_idx").on(
      table.queueId,
      table.status,
      sql`CAST(${table.opts}->>'priority' AS INTEGER)`
    ),
    index("status_updated_at_idx").on(table.status, table.updatedAt),
    index("delayed_until_status_idx")
      .on(table.delayedUntil, table.status)
      .where(sql`${table.delayedUntil} IS NOT NULL`),
    index("started_at_status_idx")
      .on(table.startedAt, table.status)
      .where(sql`${table.startedAt} IS NOT NULL`),
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
