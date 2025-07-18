import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "../../user/authentication/users.schema";

export const llmProviders = sqliteTable("llm_providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'openai', 'deepseek', 'anthropic', 'local'
  apiKey: text("api_key"), // Encrypted API key
  baseUrl: text("base_url"), // For custom endpoints
  model: text("model").notNull(), // Default model
  temperature: real("temperature").default(0.7),
  maxTokens: integer("max_tokens").default(4000),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  config: text("config"), // JSON: Additional provider-specific config
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type LlmProvider = typeof llmProviders.$inferSelect;
export type NewLlmProvider = typeof llmProviders.$inferInsert;
