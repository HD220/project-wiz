import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status", {
    enum: [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
      "RETRYING",
      "CANCELLED",
    ],
  }).notNull(),
  attempts: integer("attempts").notNull(),
  max_attempts: integer("max_attempts").notNull(),
  retry_delay: integer("retry_delay").notNull(),
  payload: text("payload"),
  data: text("data"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
});
