// src_refactored/infrastructure/persistence/in-memory/repositories/memory.repository.ts
import { injectable } from 'inversify';

import { MemoryItem } from '@/core/domain/memory/memory-item.entity';
import { IMemoryRepository, SearchFilters, SearchOptions } from '@/core/domain/memory/ports/memory-repository.interface';
import { MemoryItemId } from '@/core/domain/memory/value-objects/memory-item-id.vo';

import { NotFoundError } from '@/shared/errors/core.error';


@injectable()
export class InMemoryMemoryRepository implements IMemoryRepository {
  private readonly items: Map<string, MemoryItem> = new Map();

  async save(item: MemoryItem): Promise<void> {
    this.items.set(item.id.value, item);
  }

  async findById(id: MemoryItemId): Promise<MemoryItem | null> {
    return this.items.get(id.value) || null;
  }

  async search(filters: SearchFilters, options: SearchOptions): Promise<MemoryItem[]> {
    // Basic placeholder for search - does not implement actual filtering or embedding search
    let results = Array.from(this.items.values());
    if (filters.agentId) {
      results = results.filter(item => item.agentId?.equals(filters.agentId!));
    }
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(item =>
        filters.tags!.every(tag => item.tags.value.some(itemTag => itemTag === tag))
      );
    }
    // Does not implement options.limit, options.offset, or embedding search
    return results.slice(0, options.limit || results.length);
  }

  async delete(id: MemoryItemId): Promise<void> {
    if (!this.items.has(id.value)) {
      throw new NotFoundError(`MemoryItem with ID ${id.value} not found.`);
    }
    this.items.delete(id.value);
  }
}
