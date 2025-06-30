// src_refactored/core/application/common/ports/repository.types.ts

/**
 * Options for pagination.
 */
export interface PageOptions {
  /**
   * The page number to retrieve (1-indexed).
   */
  page: number;

  /**
   * The number of items per page.
   */
  limit: number;

  /**
   * Optional sort order (e.g., 'createdAt:asc' or 'name:desc').
   * The format and supported fields depend on the specific repository implementation.
   */
  sortBy?: string;
}

/**
 * Represents a paginated list of results.
 */
export interface PaginatedResult<T> {
  /**
   * The data for the current page.
   */
  data: T[];

  /**
   * Total number of items across all pages.
   */
  totalItems: number;

  /**
   * Total number of pages.
   */
  totalPages: number;

  /**
   * Current page number (1-indexed).
   */
  currentPage: number;

  /**
   * Number of items per page.
   */
  itemsPerPage: number;

  /**
   * Optional: Link to the next page, if available.
   */
  nextPage?: string | null;

  /**
   * Optional: Link to the previous page, if available.
   */
  previousPage?: string | null;
}

/**
 * Basic filter structure for querying repositories.
 * Can be extended by specific repositories for more complex filtering.
 */
export interface BaseQueryFilters {
  [key: string]: unknown; // Allows for arbitrary filter keys
}
