// src_refactored/core/domain/memory/ports/memory-repository.interface.ts
import { Identity } from '@/core/common/value-objects/identity.vo'; // For AgentId

import { DomainError } from '@/domain/common/errors';

import { Result } from '@/shared/result';

import { MemoryItem } from '../memory-item.entity';
import { MemoryItemEmbedding } from '../value-objects/memory-item-embedding.vo';
import { MemoryItemId } from '../value-objects/memory-item-id.vo';

import {
  MemorySearchFilters,
  PaginationOptions,
  PaginatedMemoryItemsResult,
} from './memory-repository.types';

export interface IMemoryRepository {
  /**
   * Saves a memory item entity. Handles creation or updates.
   * @param memoryItem The memory item entity to save.
   * @returns A Result containing the saved memory item or a DomainError.
   */
  save(memoryItem: MemoryItem): Promise<Result<MemoryItem, DomainError>>;

  /**
   * Finds a memory item by its ID.
   * @param id The MemoryItemId of the memory item.
   * @returns A Result containing the memory item or null if not found, or a DomainError.
   */
  findById(id: MemoryItemId): Promise<Result<MemoryItem | null, DomainError>>;

  /**
   * Finds memory items by Agent ID.
   * @param agentId The Identity of the agent.
   * @param limit Optional limit for pagination.
   * @param offset Optional offset for pagination.
   * @returns A Result containing an array of memory items or a DomainError.
   */
  findByAgentId(agentId: Identity, limit?: number, offset?: number): Promise<Result<MemoryItem[], DomainError>>;

  /**
   * Deletes a memory item by its ID.
   * @param id The MemoryItemId of the memory item to delete.
   * @returns A Result containing void or a DomainError.
   */
  delete(id: MemoryItemId): Promise<Result<void, DomainError>>;

  /**
   * Searches for memory items similar to a given embedding.
   * @param queryEmbedding The MemoryItemEmbedding to search against.
   * @param agentId Optional agentId to scope the search.
   * @param limit Optional number of similar items to return.
   * @returns A Result containing an array of similar memory items or a DomainError.
   */
  searchSimilar(
    queryEmbedding: MemoryItemEmbedding,
    agentId?: Identity,
    limit?: number,
  ): Promise<Result<MemoryItem[], DomainError>>;

  /**
   * Lists all memory items.
   * Implementations may add pagination parameters if necessary.
   * @param limit Optional limit for pagination.
   * @param offset Optional offset for pagination.
   * @returns A Result containing an array of memory items or a DomainError.
   */
  listAll(limit?: number, offset?: number): Promise<Result<MemoryItem[], DomainError>>;

  /**
   * Searches memory items based on filters and pagination.
   * @param filters The filters to apply (agentId, queryText, tags, etc.).
   * @param pagination The pagination options (page, pageSize).
   * @returns A Result containing the paginated list of memory items or a DomainError.
   */
  search(
    filters: MemorySearchFilters,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedMemoryItemsResult, DomainError>>;
}

export const IMemoryRepositoryToken = Symbol('IMemoryRepository');
