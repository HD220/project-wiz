import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "../../user/authentication/users.schema";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  gitUrl: text("git_url"), // URL do repositório remoto
  localPath: text("local_path"), // Caminho local do repositório
  iconUrl: text("icon_url"),
  iconEmoji: text("icon_emoji"), // Emoji como ícone alternativo
  visibility: text("visibility").default("private"), // 'private', 'internal'
  status: text("status").default("active"), // 'active', 'archived', 'deleted'
  settings: text("settings"), // JSON: { auto_agent_hiring, notifications, etc. }
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
