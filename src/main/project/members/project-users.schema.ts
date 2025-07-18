import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const projectUsers = sqliteTable(
  "project_users",
  {
    projectId: text("project_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").default("member"),
    permissions: text("permissions"),
    joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
    leftAt: integer("left_at", { mode: "timestamp" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  }),
);

export type ProjectUserSchema = typeof projectUsers.$inferSelect;
export type NewProjectUserSchema = typeof projectUsers.$inferInsert;
