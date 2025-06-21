// src/infrastructure/repositories/worker-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { IWorkerRepository } from '@/core/ports/repositories/worker.repository.interface';
import { Worker, WorkerConstructor } from '@/core/domain/entities/worker/worker.entity';
import {
    WorkerId,
    WorkerName,
    WorkerStatus,
    WorkerStatusType // Import enum for casting if needed
} from '@/core/domain/entities/worker/value-objects';
import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo';
import { workersTable, WorkerDbInsert, WorkerDbSelect } from '../services/drizzle/schemas/workers'; // Use workersTable
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

type DBSchema = { workersTable: typeof workersTable; /* ... other tables ... */ };

export class WorkerDrizzleRepository implements IWorkerRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: WorkerDbSelect): Worker {
        const props: WorkerConstructor = {
            id: WorkerId.create(row.id),
            name: WorkerName.create(row.name),
            status: WorkerStatus.create(row.status as WorkerStatusType), // Cast if status from DB is string
            createdAt: JobTimestamp.create(new Date(row.createdAt)),
            updatedAt: row.updatedAt ? JobTimestamp.create(new Date(row.updatedAt)) : undefined,
        };
        return Worker.create(props); // Use static create method of the Worker entity
    }

    private toPersistence(worker: Worker): WorkerDbInsert {
        const props = worker.getProps();
        return {
            id: worker.id().getValue(),
            name: props.name.getValue(),
            status: props.status.getValue(), // This is WorkerStatusType (string enum)
            createdAt: props.createdAt.getValue(), // Drizzle handles Date to timestamp_ms
            updatedAt: props.updatedAt?.getValue(),
        };
    }

    async save(worker: Worker): Promise<Result<Worker>> {
        try {
            const data = this.toPersistence(worker);
            await this.db.insert(workersTable).values(data)
                .onConflictDoUpdate({ target: workersTable.id, set: data });
            return ok(worker);
        } catch (e) {
            console.error("Error saving worker:", e);
            return error(new DomainError("Failed to save worker.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: WorkerId): Promise<Result<Worker | null>> {
        try {
            const results = await this.db.select().from(workersTable)
                .where(eq(workersTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading worker ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load worker.", e instanceof Error ? e : undefined));
        }
    }

    async findFirstAvailable(): Promise<Result<Worker | null>> {
        try {
            const results = await this.db.select().from(workersTable)
                .where(eq(workersTable.status, WorkerStatus.createAvailable().getValue())) // Compare with primitive status value
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error("Error finding available worker:", e);
            return error(new DomainError("Failed to find available worker.", e instanceof Error ? e : undefined));
        }
    }

    // Standard IRepository methods
    async findById(id: WorkerId): Promise<Result<Worker | null>> {
        return this.load(id);
    }

    async create(props: Omit<WorkerConstructor, "id">): Promise<Result<Worker>> {
        try {
            const id = WorkerId.create(); // Generate new ID
            const fullProps: WorkerConstructor = {
                id,
                name: props.name, // Already WorkerName VO
                status: props.status, // Already WorkerStatus VO
                createdAt: props.createdAt, // Already JobTimestamp VO
                updatedAt: props.updatedAt // Optional JobTimestamp VO
            };
            const worker = Worker.create(fullProps);
            return this.save(worker);
        } catch (e) {
             console.error("Error creating worker via repository:", e);
             return error(new DomainError("Failed to create worker via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(worker: Worker): Promise<Result<Worker>> {
        return this.save(worker);
    }

    async list(): Promise<Result<Worker[]>> {
        try {
            const results = await this.db.select().from(workersTable).all();
            const workers = results.map(row => this.toEntity(row));
            return ok(workers);
        } catch (e) {
            console.error("Error listing workers:", e);
            return error(new DomainError("Failed to list workers.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: WorkerId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(workersTable)
                .where(eq(workersTable.id, id.getValue()))
                .returning({ id: workersTable.id });

            if (result.length === 0) {
                 return error(new DomainError(`Worker with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting worker ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete worker.", e instanceof Error ? e : undefined));
        }
    }
}
