import {
  PageOptions,
  PaginatedResult,
} from "@/core/common/ports/repository.types";
import { Identity } from "@/core/common/value-objects/identity.vo";

import { MemoryItem } from "../memory-item.entity";

export interface MemorySearchFilters {
  agentId?: Identity | null;
  queryText?: string;
  tags?: string[];
  // Future:
  // source?: string;
  // createdAtFrom?: Date;
  // createdAtTo?: Date;
}

// Re-exporting PaginationOptions if it's generic enough, or define specific if needed
export type MemoryPaginationOptions = PageOptions;
export type PaginatedMemoryItemsResult = PaginatedResult<MemoryItem>;
