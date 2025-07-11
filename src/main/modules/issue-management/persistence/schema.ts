import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "../../project-management/persistence/schema";
import { agents } from "../../persona-management/persistence/schema";

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(), // UUID
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(), // e.g., 'open', 'in_progress', 'resolved', 'closed'
  priority: text("priority").notNull(), // e.g., 'low', 'medium', 'high'
  assignedToAgentId: text("assigned_to_agent_id").references(() => agents.id),
  createdByUserId: text("created_by_user_id"), // Optional, for future user management
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sprints = sqliteTable("sprints", {
  id: text("id").primaryKey(), // UUID
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  startDate: integer("start_date").notNull(),
  endDate: integer("end_date").notNull(),
  status: text("status").notNull(), // e.g., 'planned', 'active', 'completed'
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const sprintIssues = sqliteTable("sprint_issues", {
  sprintId: text("sprint_id")
    .notNull()
    .references(() => sprints.id),
  issueId: text("issue_id")
    .notNull()
    .references(() => issues.id),
});

export const issueDependencies = sqliteTable("issue_dependencies", {
  issueId: text("issue_id")
    .notNull()
    .references(() => issues.id),
  dependsOnIssueId: text("depends_on_issue_id")
    .notNull()
    .references(() => issues.id),
  createdAt: integer("created_at").notNull(),
});
