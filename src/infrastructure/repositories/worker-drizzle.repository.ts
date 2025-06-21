import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, asc } from 'drizzle-orm'; // Removed inArray as it's unused
import { workers, WorkersSelect } from '../services/drizzle/schemas/workers'; // Import new schema and types
import { IWorkerRepository } from '@/core/application/ports/worker-repository.interface';
import { Worker, WorkerId, WorkerStatus } from '@/core/domain/entities/worker';
import { AgentId } from '@/core/domain/entities/agent'; // For associatedAgentId

// Optional: Define a specific error if needed
export class WorkerNotFoundError extends Error {
  constructor(id: WorkerId | string) {
    super(`Worker with id ${typeof id === 'string' ? id : id.getValue()} not found`);
    this.name = 'WorkerNotFoundError';
  }
}

export class WorkerDrizzleRepository implements IWorkerRepository {
  constructor(
    // Assuming the db instance passed here is compatible with all schemas
    private readonly db: BetterSQLite3Database<typeof import('../services/drizzle/schemas')>
  ) {}

  private mapRowToEntity(row: WorkersSelect): Worker {
    const worker = Worker.create({
      id: WorkerId.fromString(row.id),
      associatedAgentId: row.associatedAgentId ? AgentId.fromString(row.associatedAgentId) : undefined,
      status: WorkerStatus.create(row.status),
      // Pass undefined for lastHeartbeatAt to let create() use its default initially, then override if DB has value
    });
    // Override createdAt and lastHeartbeatAt from DB row data after creation by static factory
    // This is a common pattern if static create methods have defaults that shouldn't apply during hydration
    const props = worker.props as any; // Use type assertion to modify readonly props post-creation for hydration
    props.createdAt = new Date(row.createdAt);
    if (row.lastHeartbeatAt) {
      props.lastHeartbeatAt = new Date(row.lastHeartbeatAt);
    }
    return worker;
  }

  private mapEntityToDrizzle(worker: Worker): Omit<WorkersSelect, 'createdAt' | 'lastHeartbeatAt'> & { createdAt: number, lastHeartbeatAt: number } {
    // This prepares an object that can be used for both insert and update's 'set'
    // createdAt is handled by schema default on insert, not updated.
    // lastHeartbeatAt is updated explicitly in 'save'.
    return {
      id: worker.id.getValue(),
      associatedAgentId: worker.associatedAgentId ? worker.associatedAgentId.getValue() : null,
      status: worker.status.getValue(),
      // createdAt will be handled by DB default on insert
      // lastHeartbeatAt will be set to Date.now() in save method for updates
    };
  }

  async findById(id: WorkerId): Promise<Worker | null> {
    const result = await this.db
      .select()
      .from(workers)
      .where(eq(workers.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result[0]);
  }

  async save(worker: Worker): Promise<void> {
    const values = this.mapEntityToDrizzle(worker);

    await this.db
      .insert(workers)
      .values({
        ...values,
        createdAt: worker.props.createdAt.getTime(), // Ensure createdAt is set for insert from entity
        lastHeartbeatAt: worker.props.lastHeartbeatAt?.getTime() ?? Date.now(),
      })
      .onConflictDoUpdate({
        target: workers.id,
        set: {
          associatedAgentId: values.associatedAgentId,
          status: values.status,
          lastHeartbeatAt: Date.now(), // Always update heartbeat on save/update
        },
      });
  }

  async findIdleWorkers(limit: number): Promise<Worker[]> {
    const idleStatus = WorkerStatus.idle().getValue();
    const results = await this.db
      .select()
      .from(workers)
      .where(eq(workers.status, idleStatus))
      .orderBy(asc(workers.createdAt)) // Example: older idle workers first
      .limit(limit);

    return results.map(row => this.mapRowToEntity(row));
  }

  async findByStatus(status: WorkerStatus): Promise<Worker[]> {
    const results = await this.db
      .select()
      .from(workers)
      .where(eq(workers.status, status.getValue()));

    return results.map(row => this.mapRowToEntity(row));
  }
}
