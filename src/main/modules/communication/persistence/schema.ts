import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

export const channels = sqliteTable("channels", {
  // ID sempre UUID
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  
  // Campos obrigatórios
  name: text("name").notNull(),
  projectId: text("project_id").notNull(),
  createdBy: text("created_by").notNull(),
  
  // Campos opcionais
  description: text("description"),
  
  // Booleanos como integer
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  
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
  // Relacionamento com projects (assumindo que existe uma tabela projects)
  // project: one(projects, {
  //   fields: [channels.projectId],
  //   references: [projects.id],
  // }),
}));

// Tipos inferidos automaticamente
export type ChannelSchema = typeof channels.$inferSelect;
export type CreateChannelSchema = typeof channels.$inferInsert;