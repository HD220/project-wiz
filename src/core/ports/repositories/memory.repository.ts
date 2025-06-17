// src/core/ports/repositories/memory.repository.ts
import { MemoryItem } from '../../domain/entities/memory/memory.entity';

export interface IMemoryRepository {
  findById(id: string): Promise<MemoryItem | null>;
  save(memoryItem: MemoryItem): Promise<void>; // Create or Update
  delete(id: string): Promise<void>;
  findByAgentId(agentId: string, limit?: number, offset?: number): Promise<MemoryItem[]>;
  // Initial search: simple keyword-based on content and tags
  search(query: string, tags?: string[], limit?: number): Promise<MemoryItem[]>;
  searchSimilar(queryEmbedding: number[], agentId?: string, limit?: number): Promise<MemoryItem[]>;
  // ^ For future semantic search capabilities. Requires embedding generation and vector search implemented.
}
