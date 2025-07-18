import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").default("medium"),
  type: text("type").default("task"),
  assigneeId: text("assignee_id"),
  assigneeType: text("assignee_type"),
  estimatedHours: real("estimated_hours"),
  actualHours: real("actual_hours"),
  storyPoints: integer("story_points"),
  labels: text("labels"),
  gitBranch: text("git_branch"),
  gitCommits: text("git_commits"),
  pullRequestUrl: text("pull_request_url"),
  metadata: text("metadata"),
  createdBy: text("created_by").notNull(),
  createdByType: text("created_by_type").notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const issueComments = sqliteTable("issue_comments", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  content: text("content").notNull(),
  contentType: text("content_type").default("markdown"),
  authorId: text("author_id").notNull(),
  authorType: text("author_type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const issueActivities = sqliteTable("issue_activities", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  actorId: text("actor_id").notNull(),
  actorType: text("actor_type").notNull(),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type IssueSchema = typeof issues.$inferSelect;
export type NewIssueSchema = typeof issues.$inferInsert;
export type IssueCommentSchema = typeof issueComments.$inferSelect;
export type NewIssueCommentSchema = typeof issueComments.$inferInsert;
export type IssueActivitySchema = typeof issueActivities.$inferSelect;
export type NewIssueActivitySchema = typeof issueActivities.$inferInsert;
