import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const messagesSchema = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  content: text("content").notNull(),
  senderId: text("sender_id").notNull(), // user ID or agent ID
  senderName: text("sender_name").notNull(),
  senderType: text("sender_type", {
    enum: ["user", "agent", "system"],
  }).notNull(),
  // Context - what type of conversation this is
  contextType: text("context_type", {
    enum: ["direct", "channel", "group"],
  }).notNull(),
  contextId: text("context_id").notNull(), // conversationId, channelId, groupId
  // Message metadata
  type: text("type", {
    enum: ["text", "code", "file", "system"],
  }).notNull().default("text"),
  metadata: text("metadata"), // JSON string for additional data
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  // Timestamps
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Conversations table for direct messages
export const conversationsSchema = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  type: text("type", {
    enum: ["direct", "group"],
  }).notNull().default("direct"),
  participants: text("participants").notNull(), // JSON string array
  lastMessageAt: text("last_message_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Channels table for project channels
export const channelsSchema = sqliteTable("channels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  projectId: text("project_id").notNull(),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type MessageSchema = typeof messagesSchema.$inferSelect;
export type CreateMessageSchema = typeof messagesSchema.$inferInsert;
export type ConversationSchema = typeof conversationsSchema.$inferSelect;
export type CreateConversationSchema = typeof conversationsSchema.$inferInsert;
export type ChannelSchema = typeof channelsSchema.$inferSelect;
export type CreateChannelSchema = typeof channelsSchema.$inferInsert;