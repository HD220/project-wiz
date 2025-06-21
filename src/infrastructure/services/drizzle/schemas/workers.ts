import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { WorkerStatusValue } from '@/core/domain/entities/worker/value-objects/worker-status.vo'; // Import new status type

// Define the enum for worker statuses based on the WorkerStatusValue type
export const workerStatusEnumValues: [WorkerStatusValue, ...WorkerStatusValue[]] = [
  'idle',
  'busy',
  'offline',
  'error',
];

export const workers = sqliteTable('workers', {
  id: text('id').primaryKey().$type<string>(), // Matches WorkerId.value (string UUID)

  // Replaces 'name'. Stores the ID of the Agent persona this worker is configured for.
  // This assumes AgentId.value is a string.
  associatedAgentId: text('associated_agent_id'),

  status: text('status', { enum: workerStatusEnumValues }).notNull().$type<WorkerStatusValue>(),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => Date.now()),

  lastHeartbeatAt: integer('last_heartbeat_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => Date.now()), // Initialize heartbeat, updated when status changes or periodically
});

// Keep these for Drizzle Kit and repository usage.
export type WorkersInsert = typeof workers.$inferInsert;
export type WorkersSelect = typeof workers.$inferSelect;
