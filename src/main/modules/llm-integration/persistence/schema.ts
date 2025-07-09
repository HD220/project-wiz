import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const llmConfigs = sqliteTable("llm_configs", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  apiKey: text("api_key").notNull(),
  temperature: real("temperature").notNull(),
  maxTokens: real("max_tokens").notNull(),
});
