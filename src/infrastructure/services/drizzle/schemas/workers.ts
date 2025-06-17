import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workers = sqliteTable("workers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status", {
    enum: ["available", "busy"],
  }).notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
});
