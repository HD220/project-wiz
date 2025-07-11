import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const personas = sqliteTable("personas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  llmModel: text("llm_model").notNull(),
  llmTemperature: real("llm_temperature").notNull(),
  tools: text("tools", { mode: "json" }).notNull(),
  // Novos campos para runtime
  role: text("role").notNull(), // 'developer', 'tester', 'designer', 'reviewer', 'assistant'
  profile: text("profile"),
  backstory: text("backstory"),
  objective: text("objective"),
  systemPrompt: text("system_prompt").notNull(),
  isBuiltIn: integer("is_built_in").notNull().default(0), // 0=false, 1=true
  status: text("status").notNull().default('idle'), // 'idle', 'working', 'paused', 'error'
  currentTaskId: text("current_task_id"),
  worktreePath: text("worktree_path"), // caminho do git worktree atual
  maxConcurrentTasks: integer("max_concurrent_tasks").notNull().default(1),
  capabilities: text("capabilities"), // JSON array de capabilities
});
