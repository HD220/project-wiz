// src_refactored/core/domain/memory/ports/memory-repository.types.ts
import { Identity } from '../../../common/value-objects/identity.vo';
import { PaginationOptions as CommonPaginationOptions } from '../../job/ports/job-repository.types'; // Reusing from Job
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
export type PaginationOptions = CommonPaginationOptions;

export interface PaginatedMemoryItemsResult {
  items: MemoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
