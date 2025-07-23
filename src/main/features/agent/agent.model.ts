import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { llmProvidersTable } from "@/main/features/agent/llm-provider/llm-provider.model";
import { usersTable } from "@/main/features/user/user.model";

export type AgentStatus = "active" | "inactive" | "busy";

export const agentsTable = sqliteTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
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
    systemPrompt: text("system_prompt").notNull(),
    status: text("status").$type<AgentStatus>().notNull().default("inactive"),
    modelConfig: text("model_config").notNull(), // JSON string
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Performance indexes for foreign keys
    userIdIdx: index("agents_user_id_idx").on(table.userId),
    ownerIdIdx: index("agents_owner_id_idx").on(table.ownerId),
    providerIdIdx: index("agents_provider_id_idx").on(table.providerId),
    statusIdx: index("agents_status_idx").on(table.status),
  }),
);

export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;
export type UpdateAgent = Partial<InsertAgent> & { id: string };
