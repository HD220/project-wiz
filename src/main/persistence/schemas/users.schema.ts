import { randomUUID } from "node:crypto";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  settings: text("settings", { mode: "json" })
    .notNull()
    .$defaultFn(() => ({
      theme: "system",
      language: "en",
      notifications: true,
    })),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type UserSchema = typeof users.$inferSelect;
export type CreateUserSchema = typeof users.$inferInsert;
