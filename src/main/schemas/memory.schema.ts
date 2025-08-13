import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./user.schema";
import { projectsTable } from "./project.schema";

// Main memory table
export const memoryTable = sqliteTable(
  "memory",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    content: text("content").notNull(),
    // embedding: text("embedding"), // Removed - vec0 handles embeddings separately
    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
  },
  (table) => ({
    createdByIdx: index("memory_created_by_idx").on(table.createdBy),
    createdAtIdx: index("memory_created_at_idx").on(table.createdAt),
  }),
);

// Agent personal memory
export const agentMemoryTable = sqliteTable(
  "agent_memory",
  {
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryTable.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.agentId] }),
    agentIdx: index("agent_memory_agent_idx").on(table.agentId),
  }),
);

// Team shared memory
export const teamMemoryTable = sqliteTable(
  "team_memory",
  {
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryTable.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.projectId] }),
    projectIdx: index("team_memory_project_idx").on(table.projectId),
  }),
);

// Project global memory
export const projectMemoryTable = sqliteTable(
  "project_memory",
  {
    memoryId: text("memory_id")
      .notNull()
      .references(() => memoryTable.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.projectId] }),
    projectIdx: index("project_memory_project_idx").on(table.projectId),
  }),
);

export type SelectMemory = typeof memoryTable.$inferSelect;
export type InsertMemory = typeof memoryTable.$inferInsert;
export type SelectAgentMemory = typeof agentMemoryTable.$inferSelect;
export type InsertAgentMemory = typeof agentMemoryTable.$inferInsert;
export type SelectTeamMemory = typeof teamMemoryTable.$inferSelect;
export type InsertTeamMemory = typeof teamMemoryTable.$inferInsert;
export type SelectProjectMemory = typeof projectMemoryTable.$inferSelect;
export type InsertProjectMemory = typeof projectMemoryTable.$inferInsert;
