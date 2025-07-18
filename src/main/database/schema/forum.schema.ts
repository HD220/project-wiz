import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { projects } from './projects.schema';

export const forumTopics = sqliteTable('forum_topics', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  description: text('description'),
  
  // Status e metadata
  status: text('status').default('open'), // 'open', 'closed', 'resolved'
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  category: text('category'), // 'discussion', 'decision', 'brainstorm', 'review'
  tags: text('tags'), // JSON array: ['frontend', 'architecture', 'bug']
  
  // Author
  createdBy: text('created_by').notNull(),
  createdByType: text('created_by_type').notNull(), // 'user', 'agent'
  
  // Tracking
  viewCount: integer('view_count').default(0),
  postCount: integer('post_count').default(0),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const forumPosts = sqliteTable('forum_posts', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => forumTopics.id, { onDelete: 'cascade' }),
  
  content: text('content').notNull(),
  contentType: text('content_type').default('markdown'), // 'markdown', 'code', 'image'
  
  // Author
  authorId: text('author_id').notNull(),
  authorType: text('author_type').notNull(), // 'user', 'agent'
  
  // Thread support
  replyToId: text('reply_to_id').references(() => forumPosts.id),
  position: integer('position').default(0), // Ordem no tópico
  
  // Metadata
  metadata: text('metadata'), // JSON: { attachments, mentions, votes, etc. }
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export type ForumTopic = typeof forumTopics.$inferSelect;
export type NewForumTopic = typeof forumTopics.$inferInsert;
export type ForumPost = typeof forumPosts.$inferSelect;
export type NewForumPost = typeof forumPosts.$inferInsert;