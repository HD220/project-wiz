import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status", {
    enum: [
      "PENDING",
      "WAITING",
      "DELAYED",
      "EXECUTING",
      "FINISHED",
      "FAILED",
      "CANCELLED",
    ],
  }).notNull(),
  attempts: integer("attempts").notNull(),
  max_attempts: integer("max_attempts").notNull(),
  retry_delay: integer("retry_delay").notNull(),
  payload: text("payload"),
  data: text("data"),
  result: text("result"),
  priority: integer("priority").notNull(),
  depends_on: text("depends_on"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
  activity_type: text("activity_type"),
  activity_context: text("activity_context", { mode: "json" }),
  parent_id: text("parent_id"),
  related_activity_ids: text("related_activity_ids", { mode: "json" }),
});
