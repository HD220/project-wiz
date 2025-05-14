import { randomUUID } from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { llmProvidersTable } from "./llm-providers";

export const llmModelsTable = sqliteTable("llm_models", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  llmProviderId: text("llm_provider_id").references(() => llmProvidersTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique("model_slug"),
});
