import { randomUUID } from "crypto";

import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const agents = sqliteTable("agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  // Agent identity (previously persona data)
  name: text("name").notNull(),
  role: text("role").notNull(),
  goal: text("goal").notNull(),
  backstory: text("backstory").notNull(),
  // LLM configuration
  llmProviderId: text("llm_provider_id").notNull(),
  temperature: real("temperature").notNull().default(0.7),
  maxTokens: integer("max_tokens").notNull().default(1000),
  // Status and metadata
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isDefault: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type AgentSchema = typeof agents.$inferSelect;
export type CreateAgentSchema = typeof agents.$inferInsert;
