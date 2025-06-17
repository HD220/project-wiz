import { randomUUID } from "crypto";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { llmProvidersConfig } from "./llm-providers-config";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  nickname: text("nickname").notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar").notNull(),
  llmProviderConfigId: text("llm_provider_config_id")
    .notNull()
    .references(() => llmProvidersConfig.id),
});
