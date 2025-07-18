import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { projects } from "../core/projects.schema";
import { agents } from "../../agents/worker/agents.schema";
import { users } from "../../user/authentication/users.schema";

export const projectAgents = sqliteTable(
  "project_agents",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id),
    role: text("role").default("developer"), // 'developer', 'designer', 'tester', etc.
    permissions: text("permissions"), // JSON array of permissions
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    addedBy: text("added_by")
      .notNull()
      .references(() => users.id),
    addedAt: integer("added_at", { mode: "timestamp" }).notNull(),
    removedAt: integer("removed_at", { mode: "timestamp" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.agentId] }),
  }),
);

export type ProjectAgent = typeof projectAgents.$inferSelect;
export type NewProjectAgent = typeof projectAgents.$inferInsert;
