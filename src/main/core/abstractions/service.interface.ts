import { Result } from "./result.type";

/**
 * Generic service interface for business logic operations
 * Defines contract for service layer implementations
 *
 * @template T - Entity type this service manages
 */
export interface IService<T> {
  /**
   * Execute business logic operation
   * @param data - Input data for the operation
   * @returns Promise resolving to Result containing success or error
   */
  execute(data: unknown): Promise<Result<T, Error>>;
}

/**
 * Extended service interface with common business operations
 * Provides standard CRUD operations with business logic validation
 *
 * @template T - Entity type
 * @template TId - Entity ID type
 */
export interface IBusinessService<T, TId = string> extends IService<T> {
  /**
   * Create a new entity with business validation
   * @param data - Entity creation data
   * @returns Promise resolving to Result with created entity or error
   */
  create(data: Omit<T, "id">): Promise<Result<T, Error>>;

  /**
   * Update an existing entity with business validation
   * @param id - Entity ID
   * @param data - Partial entity data for update
   * @returns Promise resolving to Result with updated entity or error
   */
  update(id: TId, data: Partial<T>): Promise<Result<T, Error>>;

  /**
   * Delete an entity with business validation
   * @param id - Entity ID
   * @returns Promise resolving to Result with boolean success or error
   */
  delete(id: TId): Promise<Result<boolean, Error>>;

  /**
   * Get entity by ID with business logic
   * @param id - Entity ID
   * @returns Promise resolving to Result with entity or error
   */
  getById(id: TId): Promise<Result<T, Error>>;

  /**
   * Get all entities with business logic
   * @returns Promise resolving to Result with entities array or error
   */
  getAll(): Promise<Result<T[], Error>>;
}
