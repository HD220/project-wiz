import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { llmProvidersTable } from "@/main/agents/llm-providers/llm-providers.schema";
import { usersTable } from "@/main/user/users.schema";

export type AgentStatus = "active" | "inactive" | "busy";

export const agentsTable = sqliteTable("agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;
export type UpdateAgent = Partial<InsertAgent> & { id: string };
