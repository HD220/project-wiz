import { randomUUID } from "crypto";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { llmProviders } from "./llm-providers";

export const llmModels = sqliteTable("llm_models", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  llmProviderId: text("llm_provider_id").references(() => llmProviders.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique("model_slug"),
});
