import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "../../project-management/persistence/schema";

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(), // 'general', 'development', 'qa', etc.
  type: text("type").notNull(), // 'text', 'direct_message'
  description: text("description"),
  isDefault: integer("is_default").notNull().default(0), // canal padrão do projeto
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id")
    .notNull()
    .references(() => channels.id),
  senderId: text("sender_id").notNull(), // pode ser user ou agent id
  senderType: text("sender_type").notNull(), // 'user' ou 'agent'
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // 'text', 'task_update', 'file_share', 'system'
  metadata: text("metadata"), // JSON para attachments, mentions, etc.
  replyToMessageId: text("reply_to_message_id").references(() => messages.id),
  timestamp: integer("timestamp").notNull(),
  isRead: integer("is_read").notNull().default(0),
  isEdited: integer("is_edited").notNull().default(0),
  editedAt: integer("edited_at"),
});

export const messageMentions = sqliteTable("message_mentions", {
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id),
  mentionedId: text("mentioned_id").notNull(), // user ou agent id
  mentionedType: text("mentioned_type").notNull(), // 'user' ou 'agent'
  createdAt: integer("created_at").notNull(),
});
