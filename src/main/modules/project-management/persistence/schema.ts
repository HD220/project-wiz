import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(),
  description: text("description"),
  localPath: text("local_path").notNull(),
  remoteUrl: text("remote_url"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});