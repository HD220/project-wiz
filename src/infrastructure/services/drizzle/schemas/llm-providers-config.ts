import { randomUUID } from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { llmProviders } from "./llm-providers";
import { llmModels } from "./llm-models";

export const llmProvidersConfig = sqliteTable("llm_providers_config", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  providerId: text("provider_id")
    .notNull()
    .references(() => llmProviders.id),
  modelId: text("model_id")
    .notNull()
    .references(() => llmModels.id),
  apiKey: text("api_key").notNull(),
});
