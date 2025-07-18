import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const forumTopics = sqliteTable("forum_topics", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open"),
  priority: text("priority").default("medium"),
  category: text("category"),
  tags: text("tags"),
  createdBy: text("created_by").notNull(),
  createdByType: text("created_by_type").notNull(),
  viewCount: integer("view_count").default(0),
  postCount: integer("post_count").default(0),
  lastActivityAt: integer("last_activity_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const forumPosts = sqliteTable("forum_posts", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").notNull(),
  content: text("content").notNull(),
  contentType: text("content_type").default("markdown"),
  authorId: text("author_id").notNull(),
  authorType: text("author_type").notNull(),
  replyToId: text("reply_to_id"),
  position: integer("position").default(0),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type ForumTopicSchema = typeof forumTopics.$inferSelect;
export type NewForumTopicSchema = typeof forumTopics.$inferInsert;
export type ForumPostSchema = typeof forumPosts.$inferSelect;
export type NewForumPostSchema = typeof forumPosts.$inferInsert;
