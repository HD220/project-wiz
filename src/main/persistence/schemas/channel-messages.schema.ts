import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { channels } from "./channels.schema";

export const channelMessages = sqliteTable("channel_messages", {
  // ID sempre UUID
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),

  // Campos obrigatórios
  content: text("content").notNull(),
  channelId: text("channel_id").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),

  // Tipo de mensagem
  type: text("type", {
    enum: ["text", "code", "file", "system"],
  })
    .notNull()
    .default("text"),

  // Metadados opcionais (JSON)
  metadata: text("metadata"), // Stored as JSON string

  // Flags
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),

  // Timestamps automáticos
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relações
export const channelMessagesRelations = relations(
  channelMessages,
  ({ one }) => ({
    channel: one(channels, {
      fields: [channelMessages.channelId],
      references: [channels.id],
    }),
  }),
);

// Tipos inferidos automaticamente
export type ChannelMessageSchema = typeof channelMessages.$inferSelect;
export type CreateChannelMessageSchema = typeof channelMessages.$inferInsert;
