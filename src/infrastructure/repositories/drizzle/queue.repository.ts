// src/infrastructure/repositories/drizzle/queue.repository.ts

import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
type DrizzleDB = BetterSQLite3Database<any>;

import { queuesTable, InsertQueue, SelectQueue } from '../../services/drizzle/schemas/queues'; // Path to queues schema
import { Queue } from '../../../core/domain/entities/queue/queue.entity';
import { IQueueRepository } from '../../../core/ports/repositories/queue.interface';
import { eq } from 'drizzle-orm';

// Helper to convert DB row to Queue entity
function dbToDomain(row: SelectQueue): Queue {
  // The 'jobIds' field in QueueProps was noted as potentially redundant if job.queueId is the primary link.
  // The current queuesTable schema does not include a job_ids column.
  // If it were added, parsing logic would be needed here.
  // Example:
  // let jobIdsArray: string[] = [];
  // if (row.jobIds) { // Assuming row.jobIds is a string from DB
  //   try {
  //     jobIdsArray = JSON.parse(row.jobIds);
  //   } catch (error) {
  //     console.error(`Failed to parse jobIds for queue ${row.id}:`, error);
  //   }
  // }

  return new Queue({
    id: row.id,
    name: row.name,
    concurrency: row.concurrency,
    // jobIds: jobIdsArray, // This would be used if queuesTable.jobIds existed
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  });
}

// Helper to convert Queue entity to DB insert/update object
function domainToDb(queue: Queue): InsertQueue {
  // Current queuesTable schema does not have job_ids. If it did:
  // const jobIdsJson = queue.jobIds && queue.jobIds.length > 0 ? JSON.stringify(queue.jobIds) : null;

  return {
    id: queue.id,
    name: queue.name,
    concurrency: queue.concurrency,
    // jobIds: jobIdsJson, // This would be used if queuesTable.jobIds existed and was part of InsertQueue type
    createdAt: queue.createdAt, // Pass Date object, Drizzle handles conversion for timestamp_ms
    updatedAt: queue.updatedAt,
  };
}

export class DrizzleQueueRepository implements IQueueRepository {
  private readonly repositoryDB: DrizzleDB;

  constructor(dbInstance: DrizzleDB) {
    this.repositoryDB = dbInstance;
  }

  async findById(id: string): Promise<Queue | null> {
    const result = await this.repositoryDB.select().from(queuesTable).where(eq(queuesTable.id, id)).limit(1);
    if (result.length === 0) {
      return null;
    }
    return dbToDomain(result[0]);
  }

  async findByName(name: string): Promise<Queue | null> {
    const result = await this.repositoryDB.select().from(queuesTable).where(eq(queuesTable.name, name)).limit(1);
    if (result.length === 0) {
      return null;
    }
    return dbToDomain(result[0]);
  }

  async save(queue: Queue): Promise<void> {
    const dbQueueData = domainToDb(queue);

    // Drizzle's insert with onConflictDoUpdate (upsert)
    // Ensure values align with InsertQueue type.
    // createdAt and updatedAt have defaults in schema but we provide from entity.
    await this.repositoryDB.insert(queuesTable).values(dbQueueData)
      .onConflictDoUpdate({
        target: queuesTable.id, // Conflict on ID. Can also be an array of columns for composite PK.
                                 // If upserting based on 'name', target would be queuesTable.name
        set: { // Fields to update on conflict
          name: dbQueueData.name,
          concurrency: dbQueueData.concurrency,
          // jobIds: dbQueueData.jobIds, // if used and part of InsertQueue
          updatedAt: new Date(), // Explicitly set updatedAt on any update/upsert
        }
    });
  }

  // Optional methods from the template:
  // async delete(id: string): Promise<void> {
  //   await this.repositoryDB.delete(queuesTable).where(eq(queuesTable.id, id));
  // }

  // async listAll(limit: number = 10, offset: number = 0): Promise<Queue[]> {
  //   const results = await this.repositoryDB.select().from(queuesTable).limit(limit).offset(offset);
  //   return results.map(dbToDomain);
  // }
}
