import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export const llmMessagesTable = sqliteTable(
  "llm_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // Note: Removed reference to messagesTable as this is internal agent data
    agentExecutionId: text("agent_execution_id").notNull(), // References to agent execution/job
    role: text("role")
      .$type<"user" | "assistant" | "system" | "tool">()
      .notNull(),
    content: text("content").notNull(),

    // Soft deletion fields
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    // Performance indexes
    ownerIdIdx: index("llm_messages_owner_id_idx").on(table.ownerId),
    agentExecutionIdIdx: index("llm_messages_agent_execution_id_idx").on(
      table.agentExecutionId,
    ),
    roleIdx: index("llm_messages_role_idx").on(table.role),
    createdAtIdx: index("llm_messages_created_at_idx").on(table.createdAt),

    // Soft deletion indexes
    deactivatedAtIdx: index("llm_messages_deactivated_at_idx").on(
      table.deactivatedAt,
    ),
  }),
);

export type SelectLlmMessage = typeof llmMessagesTable.$inferSelect;
export type InsertLlmMessage = typeof llmMessagesTable.$inferInsert;
