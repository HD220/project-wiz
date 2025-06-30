// src_refactored/core/domain/memory/ports/memory-repository.types.ts
import { Identity } from '@/core/common/value-objects/identity.vo'; // Corrected alias
import { PageOptions, PaginatedResult } from '@/core/application/common/ports/repository.types'; // Use new common types
import { MemoryItem } from '../memory-item.entity';

export interface MemorySearchFilters {
  agentId?: Identity | null; // Allow null to explicitly search for unassigned
  queryText?: string;
  tags?: string[];
  // Future:
  // source?: string;
  // createdAtFrom?: Date;
  // createdAtTo?: Date;
}

// Re-exporting PaginationOptions if it's generic enough, or define specific if needed
export type MemoryPaginationOptions = PageOptions; // Use PageOptions from common
export type PaginatedMemoryItemsResult = PaginatedResult<MemoryItem>; // Use PaginatedResult from common
