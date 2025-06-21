// src/infrastructure/repositories/queue-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { IQueueRepository } from '@/core/ports/repositories/queue.repository.interface';
import { Queue, QueueConstructor } from '@/core/domain/entities/queue/queue.entity';
import {
    QueueId,
    QueueName,
    QueueStatus,
    QueueStatusType // Import for casting
} from '@/core/domain/entities/queue/value-objects';
import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo'; // Reusing
import { queuesTable, QueueDbInsert, QueueDbSelect } from '../services/drizzle/schemas/queues'; // Schema Drizzle
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

// Define a type for the schema that the db instance will expect
type DBSchema = { queuesTable: typeof queuesTable; /* ... other tables ... */ };

export class QueueDrizzleRepository implements IQueueRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: QueueDbSelect): Queue {
        const props: QueueConstructor = {
            id: QueueId.create(row.id),
            name: QueueName.create(row.name),
            status: QueueStatus.create(row.status as QueueStatusType), // Cast if status from DB is string
            createdAt: JobTimestamp.create(new Date(row.createdAt)),
            updatedAt: row.updatedAt ? JobTimestamp.create(new Date(row.updatedAt)) : undefined,
        };
        return Queue.create(props); // Use the static create method of the Queue entity
    }

    private toPersistence(queue: Queue): QueueDbInsert {
        const props = queue.getProps();
        return {
            id: queue.id().getValue(),
            name: props.name.getValue(),
            status: props.status.getValue(), // This is QueueStatusType (string enum)
            createdAt: props.createdAt.getValue(), // Drizzle handles Date to timestamp_ms
            updatedAt: props.updatedAt?.getValue(),
        };
    }

    async save(queue: Queue): Promise<Result<Queue>> {
        try {
            const data = this.toPersistence(queue);
            await this.db.insert(queuesTable).values(data)
                .onConflictDoUpdate({ target: queuesTable.id, set: data });
            return ok(queue);
        } catch (e) {
            console.error("Error saving queue:", e);
            return error(new DomainError("Failed to save queue.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: QueueId): Promise<Result<Queue | null>> {
        try {
            const results = await this.db.select().from(queuesTable)
                .where(eq(queuesTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading queue ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load queue.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: QueueId): Promise<Result<Queue | null>> { // For IRepository compatibility
        return this.load(id);
    }

    async create(props: Omit<QueueConstructor, "id">): Promise<Result<Queue>> {
        try {
            const id = QueueId.create(); // Generate new ID
            // Ensure all VOs are correctly instantiated if props contains primitives
            // For IRepository<C>, props are ConstructorParameters<C> minus 'id'.
            // Queue.create expects QueueConstructor (all VOs).
            // This means props should already contain VOs for name, status, createdAt.
            const fullProps: QueueConstructor = {
                id,
                name: props.name, // Assume props.name is QueueName
                status: props.status, // Assume props.status is QueueStatus
                createdAt: props.createdAt, // Assume props.createdAt is JobTimestamp
                updatedAt: props.updatedAt // Assume props.updatedAt is JobTimestamp | undefined
            };
            const queue = Queue.create(fullProps);
            return this.save(queue);
        } catch (e) {
             console.error("Error creating queue via repository:", e);
             return error(new DomainError("Failed to create queue via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(queue: Queue): Promise<Result<Queue>> { // For IRepository compatibility
        return this.save(queue);
    }

    async list(): Promise<Result<Queue[]>> {
        try {
            const results = await this.db.select().from(queuesTable).all();
            const queues = results.map(row => this.toEntity(row));
            return ok(queues);
        } catch (e) {
            console.error("Error listing queues:", e);
            return error(new DomainError("Failed to list queues.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: QueueId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(queuesTable)
                .where(eq(queuesTable.id, id.getValue()))
                .returning({ id: queuesTable.id }); // Check if any row was affected

            if (result.length === 0) {
                 return error(new DomainError(`Queue with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting queue ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete queue.", e instanceof Error ? e : undefined));
        }
    }
}
