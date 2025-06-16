// src/core/ports/repositories/memory.repository.ts
import { MemoryItem } from '../../domain/entities/memory/memory.entity';

export interface IMemoryRepository {
  findById(id: string): Promise<MemoryItem | null>;
  save(memoryItem: MemoryItem): Promise<void>; // Create or Update
  delete(id: string): Promise<void>;
  // Initial search: simple keyword-based on content and tags
  search(query: string, tags?: string[], limit?: number): Promise<MemoryItem[]>;
}
