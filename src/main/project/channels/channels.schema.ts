import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "../core/projects.schema";
import { users } from "../../user/authentication/users.schema";

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("text"), // 'text' (futuro: 'voice')
  position: integer("position").default(0), // Ordem na sidebar
  isPrivate: integer("is_private", { mode: "boolean" }).default(false),
  permissions: text("permissions"), // JSON: roles e permissões
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
