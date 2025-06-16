import { Result, ok, error } from "../../shared/result";
import { Worker } from "../../core/domain/entities/worker/worker.entity";
import { WorkerId } from "../../core/domain/entities/worker/value-objects/worker-id.vo";
import { WorkerRepository } from "../../core/application/ports/worker-repository.interface";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { workers } from "../../infrastructure/services/drizzle/schemas/workers";
import { eq, sql } from "drizzle-orm";
import { WorkerStatus } from "../../core/domain/entities/worker/value-objects/worker-status.vo";

export class WorkerDrizzleRepository implements WorkerRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}

  async create(worker: Worker): Promise<Result<Worker>> {
    try {
      await this.db.insert(workers).values({
        id: sql`${worker.id.value}`,
        name: sql`${worker.name}`,
        status: sql`${worker.status.value}`,
        created_at: sql`${worker.createdAt.toISOString()}`,
        updated_at: worker.updatedAt
          ? sql`${worker.updatedAt.toISOString()}`
          : undefined,
      });

      return ok(worker);
    } catch (err) {
      return error(
        `Failed to create worker: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async findById(id: WorkerId): Promise<Result<Worker>> {
    try {
      const result = await this.db
        .select()
        .from(workers)
        .where(eq(workers.id, sql`${id.value}`))
        .get();

      if (!result) {
        return error("Worker not found");
      }

      const worker = new Worker({
        id: new WorkerId(result.id),
        name: result.name,
        status: new WorkerStatus(result.status),
        createdAt: new Date(result.created_at),
        updatedAt: result.updated_at ? new Date(result.updated_at) : undefined,
      });

      return ok(worker);
    } catch (err) {
      return error(
        `Failed to find worker: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async update(worker: Worker): Promise<Result<Worker>> {
    try {
      const changes = await this.db
        .update(workers)
        .set({
          name: worker.name,
          status: sql`${worker.status.value}`,
          updated_at: new Date().toISOString(),
        })
        .where(eq(workers.id, sql`${worker.id.value}`))
        .run();

      if (changes.changes === 0) {
        return error("Worker not found or no changes made");
      }

      return ok(worker);
    } catch (err) {
      return error(
        `Failed to update worker: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async delete(id: WorkerId): Promise<Result<void>> {
    try {
      const changes = await this.db
        .delete(workers)
        .where(eq(workers.id, sql`${id.value}`))
        .run();

      if (changes.changes === 0) {
        return error("Worker not found");
      }

      return ok(undefined);
    } catch (err) {
      return error(
        `Failed to delete worker: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async list(): Promise<Result<Worker[]>> {
    try {
      const results = await this.db.select().from(workers).all();

      const workersList = results.map(
        (result) =>
          new Worker({
            id: new WorkerId(result.id),
            name: result.name,
            status: new WorkerStatus(result.status),
            createdAt: new Date(result.created_at),
            updatedAt: result.updated_at
              ? new Date(result.updated_at)
              : undefined,
          })
      );

      return ok(workersList);
    } catch (err) {
      return error(
        `Failed to list workers: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
