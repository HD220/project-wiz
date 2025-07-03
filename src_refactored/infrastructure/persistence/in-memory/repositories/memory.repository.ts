// src_refactored/infrastructure/persistence/in-memory/repositories/memory.repository.ts
import { injectable } from 'inversify';

import { MemoryItem } from '@/core/domain/memory/memory-item.entity';
import { IMemoryRepository, SearchFilters, SearchOptions } from '@/core/domain/memory/ports/memory-repository.interface';
import { MemoryItemId } from '@/core/domain/memory/value-objects/memory-item-id.vo';

import { Result, Ok, Err } from '@/shared/result';


@injectable()
export class InMemoryMemoryRepository implements IMemoryRepository {
  private readonly items: Map<string, MemoryItem> = new Map();

  async save(item: MemoryItem): Promise<Result<void, Error>> {
    this.items.set(item.id.value, item);
    return Ok(undefined);
  }

  async findById(id: MemoryItemId): Promise<Result<MemoryItem | null, Error>> {
    const item = this.items.get(id.value);
    return Ok(item || null);
  }

  async search(filters: SearchFilters, options: SearchOptions): Promise<Result<MemoryItem[], Error>> {
    // Basic placeholder for search - does not implement actual filtering or embedding search
    let results = Array.from(this.items.values());
    if (filters.agentId) {
      results = results.filter(item => item.agentId()?.equals(filters.agentId!));
    }
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(item =>
        filters.tags!.every(tag => item.tags.value.some(itemTag => itemTag === tag))
      );
    }
    // Does not implement options.limit, options.offset, or embedding search
    return Ok(results.slice(0, options.limit || results.length));
  }

  async delete(id: MemoryItemId): Promise<Result<void, Error>> {
    if (!this.items.has(id.value)) {
      return Err(new Error(`MemoryItem with ID ${id.value} not found.`));
    }
    this.items.delete(id.value);
    return Ok(undefined);
  }
}
