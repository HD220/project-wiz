import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
// Assuming AgentId.value is a string (UUID)
// No direct import of AgentId VO here, just using its primitive type for the schema.

export const agentStates = sqliteTable('agent_states', {
  // agentId is the primary key, referencing AgentId.value
  agentId: text('agent_id').primaryKey().$type<string>(),

  // Fields from AgentInternalStateProps (storing as text or json as appropriate)
  // For simplicity, storing potentially complex string fields as text.
  // If they were structured objects, json mode would be better.
  currentProjectId: text('current_project_id'), // Assuming ProjectId is also a string UUID
  currentGoal: text('current_goal'),
  generalNotes: text('general_notes'), // Could be large, text is appropriate

  // Example for a date, if AgentInternalState had one
  // lastProcessedActivityTimestamp: integer('last_processed_activity_timestamp', { mode: 'timestamp_ms' }),

  // Standard audit timestamp
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => Date.now()),
});

export type AgentStatesInsert = typeof agentStates.$inferInsert;
export type AgentStatesSelect = typeof agentStates.$inferSelect;
