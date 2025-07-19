import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type ProjectStatus = "active" | "archived";

export const projectsTable = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  gitUrl: text("git_url"),
  branch: text("branch"),
  localPath: text("local_path").notNull(),
  status: text("status").$type<ProjectStatus>().notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type UpdateProject = Partial<InsertProject> & { id: string };
