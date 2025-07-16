import { randomUUID } from "crypto";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const channelMessages = sqliteTable("channel_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),

  content: text("content").notNull(),
  channelId: text("channel_id").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),

  type: text("type", {
    enum: ["text", "code", "file", "system"],
  })
    .notNull()
    .default("text"),

  metadata: text("metadata"),

  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ChannelMessageSchema = typeof channelMessages.$inferSelect;
export type CreateChannelMessageSchema = typeof channelMessages.$inferInsert;
