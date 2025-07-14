/**
 * Generic repository interface for data access operations
 * Provides basic CRUD operations for entities
 *
 * @template T - Entity type
 * @template TId - Entity ID type
 */
export interface IRepository<T, TId = string> {
  /**
   * Find an entity by its ID
   * @param id - Entity ID
   * @returns Promise resolving to entity or null if not found
   */
  findById(id: TId): Promise<T | null>;

  /**
   * Find all entities
   * @returns Promise resolving to array of entities
   */
  findAll(): Promise<T[]>;

  /**
   * Create a new entity
   * @param entity - Entity data without ID
   * @returns Promise resolving to created entity
   */
  create(entity: Omit<T, "id">): Promise<T>;

  /**
   * Update an existing entity
   * @param id - Entity ID
   * @param entity - Partial entity data for update
   * @returns Promise resolving to updated entity or null if not found
   */
  update(id: TId, entity: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity by ID
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating success
   */
  delete(id: TId): Promise<boolean>;

  /**
   * Check if entity exists
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating existence
   */
  exists(id: TId): Promise<boolean>;
}
