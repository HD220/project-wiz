import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { channels } from "../../project/channels/channels.schema";
import { dmConversations } from "../../user/direct-messages/dm-conversations.schema";

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  // Channel message ou DM
  channelId: text("channel_id").references(() => channels.id, {
    onDelete: "cascade",
  }),
  dmConversationId: text("dm_conversation_id").references(
    () => dmConversations.id,
    { onDelete: "cascade" },
  ),

  content: text("content").notNull(),
  contentType: text("content_type").default("text"), // 'text', 'image', 'file', 'code'

  // Author pode ser user ou agent
  authorId: text("author_id").notNull(),
  authorType: text("author_type").notNull(), // 'user', 'agent'

  // Tipo de mensagem
  messageType: text("message_type").default("text"), // 'text', 'system', 'task_result', 'notification'

  // Metadata adicional
  metadata: text("metadata"), // JSON: { mentions, attachments, reactions, etc. }

  // Thread/Reply support
  replyToId: text("reply_to_id"),
  threadId: text("thread_id"), // Para agrupar respostas

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
