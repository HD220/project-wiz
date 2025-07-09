import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const personas = sqliteTable("personas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  llmModel: text("llm_model").notNull(),
  llmTemperature: real("llm_temperature").notNull(),
  tools: text("tools", { mode: "json" }).notNull(),
});
