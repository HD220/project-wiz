// src/infrastructure/services/drizzle/schemas/queues.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const queuesTable = sqliteTable('queues', {
    id: text('id').primaryKey(), // From QueueId.getValue() (string UUID)
    name: text('name').notNull().unique(), // From QueueName.getValue() (string)
    status: text('status').notNull(), // From QueueStatus.getValue() (string enum: "ACTIVE", "PAUSED", "DRAINING")

    // Using JobTimestamp, which stores Date. Drizzle handles Date to timestamp_ms (integer)
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export type QueueDbInsert = typeof queuesTable.$inferInsert;
export type QueueDbSelect = typeof queuesTable.$inferSelect;
