// src/core/ports/repositories/queue.interface.ts

import { Queue } from '../../domain/entities/queue/queue.entity';

export interface IQueueRepository {
  findById(id: string): Promise<Queue | null>;
  findByName(name: string): Promise<Queue | null>;
  save(queue: Queue): Promise<void>; // Should handle both create and update
  // Optional: delete(id: string): Promise<void>;
  // Optional: listAll(limit?: number, offset?: number): Promise<Queue[]>;
}