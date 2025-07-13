import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { conversations } from "./conversations.schema";

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  content: text("content").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderType: text("sender_type", {
    enum: ["user", "agent", "system"],
  }).notNull(),
  conversationId: text("conversation_id").notNull(),
  // Additional fields for compatibility with messaging module
  contextType: text("context_type", {
    enum: ["direct", "channel", "group"],
  }).notNull().default("direct"),
  contextId: text("context_id").notNull(),
  type: text("type", {
    enum: ["text", "code", "file", "system"],
  }).notNull().default("text"),
  metadata: text("metadata"), // JSON string for additional data
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Relations
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export type MessageSchema = typeof messages.$inferSelect;
export type CreateMessageSchema = typeof messages.$inferInsert;