import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { llmProvidersTable } from "@/main/schemas/llm-provider.schema";
import { usersTable } from "@/main/schemas/user.schema";

export type AgentStatus = "active" | "inactive" | "busy";

export const agentsTable = sqliteTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .references(() => usersTable.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    providerId: text("provider_id")
      .notNull()
      .references(() => llmProvidersTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    backstory: text("backstory").notNull(),
    goal: text("goal").notNull(),
    status: text("status").$type<AgentStatus>().notNull().default("inactive"),
    modelConfig: text("model_config").notNull(), // JSON string

    // Soft deletion fields
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
  },
  (table) => ({
    // Performance indexes for foreign keys
    ownerIdIdx: index("agents_owner_id_idx").on(table.ownerId),
    providerIdIdx: index("agents_provider_id_idx").on(table.providerId),
    statusIdx: index("agents_status_idx").on(table.status),
    deactivatedByIdx: index("agents_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("agents_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("agents_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),
  }),
);

export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;
export type UpdateAgent = Partial<InsertAgent> & { id: string };
