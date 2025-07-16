import { randomUUID } from "crypto";

import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { projects } from "./projects.schema";

export const channels = sqliteTable("channels", {
  // ID sempre UUID
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),

  // Campos obrigatórios
  name: text("name").notNull(),
  projectId: text("project_id").notNull(),

  // Campos opcionais
  description: text("description"),

  // Timestamps automáticos
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relações
export const channelsRelations = relations(channels, ({ one }) => ({
  project: one(projects, {
    fields: [channels.projectId],
    references: [projects.id],
  }),
}));

// Tipos inferidos automaticamente
export type ChannelSchema = typeof channels.$inferSelect;
export type CreateChannelSchema = typeof channels.$inferInsert;
