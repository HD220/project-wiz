import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const llmProviders = sqliteTable("llm_providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  apiKey: text("api_key").notNull(),
  isDefault: integer("is_default", { mode: "boolean" })
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type LlmProviderSchema = typeof llmProviders.$inferSelect;
export type CreateLlmProviderSchema = typeof llmProviders.$inferInsert;
