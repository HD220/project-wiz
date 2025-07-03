// src_refactored/core/domain/memory/ports/memory-repository.interface.ts
import { Identity } from "@/core/common/value-objects/identity.vo";

import { MemoryItem } from "../memory-item.entity";
import { MemoryItemEmbedding } from "../value-objects/memory-item-embedding.vo";
import { MemoryItemId } from "../value-objects/memory-item-id.vo";

import {
  MemorySearchFilters,
  PaginationOptions,
  PaginatedMemoryItemsResult,
} from "./memory-repository.types";

export interface IMemoryRepository {
  save(memoryItem: MemoryItem): Promise<MemoryItem>;

  findById(id: MemoryItemId): Promise<MemoryItem | null>;

  findByAgentId(
    agentId: Identity,
    limit?: number,
    offset?: number
  ): Promise<MemoryItem[]>;

  delete(id: MemoryItemId): Promise<void>;

  searchSimilar(
    queryEmbedding: MemoryItemEmbedding,
    agentId?: Identity,
    limit?: number
  ): Promise<MemoryItem[]>;

  listAll(limit?: number, offset?: number): Promise<MemoryItem[]>;

  search(
    filters: MemorySearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedMemoryItemsResult>;
}

export const IMemoryRepositoryToken = Symbol("IMemoryRepository");