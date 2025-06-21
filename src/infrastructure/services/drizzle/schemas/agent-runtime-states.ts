// src/infrastructure/services/drizzle/schemas/agent-runtime-states.ts
import { sqliteTable, text, blob } from 'drizzle-orm/sqlite-core';
// Assuming agentId might reference an agents table if it exists, but not strictly enforced here
// import { agentsTable } from './agents';

// Define types for what will be stored in JSON blobs for collections
// These should align with what NoteText.create() and PromiseText.create() expect if rehydrating.
// If collections are just string arrays, then it's simpler.
// Based on NoteText/PromiseText VOs, they take a string.
type NoteTextPrimitive = { text: string };
type PromiseTextPrimitive = { text: string };

export const agentRuntimeStatesTable = sqliteTable('agent_runtime_states', {
    agentId: text('agent_id').primaryKey(), // From AgentId.getValue() (string UUID)
        // .references(() => agentsTable.id), // Optional: if you have an agentsTable and want FK constraint

    currentProjectId: text('current_project_id'), // From ProjectId.getValue(), optional
    currentIssueId: text('current_issue_id'), // From IssueId.getValue(), optional (string or number, stored as text)
    currentGoal: text('current_goal'), // From GoalToPlan.getValue(), optional

    // Storing collections as JSON arrays of their primitive parts
    generalNotes: blob('general_notes', { mode: 'json' }).$type<NoteTextPrimitive[] | null>(),
    promisesMade: blob('promises_made', { mode: 'json' }).$type<PromiseTextPrimitive[] | null>(),

    // Timestamps can be added if AgentRuntimeState entity includes them
    // createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    // updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export type AgentRuntimeStateDbInsert = typeof agentRuntimeStatesTable.$inferInsert;
export type AgentRuntimeStateDbSelect = typeof agentRuntimeStatesTable.$inferSelect;
