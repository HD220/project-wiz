import { injectable } from 'inversify';

import { Identity } from '@/core/common/value-objects/identity.vo';
import { MemoryItem } from '@/core/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/core/domain/memory/ports/memory-repository.interface';
import { MemorySearchFilters, PaginatedMemoryItemsResult, PaginationOptions } from '@/core/domain/memory/ports/memory-repository.types';
import { MemoryItemEmbedding } from '@/core/domain/memory/value-objects/memory-item-embedding.vo';
import { MemoryItemId } from '@/core/domain/memory/value-objects/memory-item-id.vo';

import { NotFoundError } from '@/shared/errors/core.error';


@injectable()
export class InMemoryMemoryRepository implements IMemoryRepository {
  private readonly items: Map<string, MemoryItem> = new Map();

  async save(item: MemoryItem): Promise<MemoryItem> {
    this.items.set(item.id.value, item);
    return item;
  }

  async findById(id: MemoryItemId): Promise<MemoryItem | null> {
    return this.items.get(id.value) || null;
  }

  async search(filters: MemorySearchFilters, options: PaginationOptions): Promise<PaginatedMemoryItemsResult> {
    let filteredItems = Array.from(this.items.values());

    if (filters.agentId) {
      filteredItems = filteredItems.filter(item => item.agentId?.equals(filters.agentId!));
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        filters.tags!.every((tag: string) => item.tags.value.some(itemTag => itemTag === tag))
      );
    }

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      totalItems,
      totalPages,
      currentPage: options.page,
      itemsPerPage: options.limit,
    };
  }

  async findByAgentId(
    agentId: Identity,
    limit?: number,
    offset?: number
  ): Promise<MemoryItem[]> {
    let items = Array.from(this.items.values()).filter(item => item.agentId?.equals(agentId));
    if (limit !== undefined && offset !== undefined) {
      items = items.slice(offset, offset + limit);
    }
    return items;
  }

  async searchSimilar(
    queryEmbedding: MemoryItemEmbedding,
    agentId?: Identity,
    limit?: number
  ): Promise<MemoryItem[]> {
    // This is a simplified implementation. A real implementation would use a vector database.
    let items = Array.from(this.items.values());
    if (agentId) {
      items = items.filter(item => item.agentId?.equals(agentId));
    }
    // For demonstration, just return the first 'limit' items.
    return items.slice(0, limit);
  }

  async listAll(limit?: number, offset?: number): Promise<MemoryItem[]> {
    let items = Array.from(this.items.values());
    if (limit !== undefined && offset !== undefined) {
      items = items.slice(offset, offset + limit);
    }
    return items;
  }

  async delete(id: MemoryItemId): Promise<void> {
    if (!this.items.has(id.value)) {
      throw new NotFoundError(`MemoryItem with ID ${id.value} not found.`);
    }
    this.items.delete(id.value);
  }
}