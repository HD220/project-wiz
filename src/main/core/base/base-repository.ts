/**
 * Base repository class providing common data access functionality
 * Implements standardized CRUD operations with error handling and logging
 */

import { IRepository } from "../abstractions";

/**
 * Abstract base class for all repositories in the system
 * Provides common repository functionality with:
 * - CRUD operations
 * - Error handling and logging
 * - Validation of input parameters
 * - Consistent null/undefined handling
 */
export abstract class BaseRepository<T, TId = string>
  implements IRepository<T, TId>
{
  protected readonly repositoryName: string;

  /**
   * Creates a new repository instance
   * @param repositoryName - Name of the repository for logging purposes
   */
  protected constructor(repositoryName: string) {
    this.repositoryName = repositoryName;
  }

  /**
   * Find an entity by its ID
   * @param id - Entity ID
   * @returns Promise resolving to entity or null if not found
   */
  public async findById(id: TId): Promise<T | null> {
    try {
      this.logOperation("findById", { id });

      if (!id) {
        throw new Error("ID cannot be null or undefined");
      }

      const entity = await this.doFindById(id);
      this.logOperationSuccess("findById", { id }, entity);
      return entity;
    } catch (error) {
      this.logError("findById", error, { id });
      throw error;
    }
  }

  /**
   * Find all entities
   * @returns Promise resolving to array of entities
   */
  public async findAll(): Promise<T[]> {
    try {
      this.logOperation("findAll", {});

      const entities = await this.doFindAll();
      this.logOperationSuccess("findAll", {}, entities);
      return entities;
    } catch (error) {
      this.logError("findAll", error, {});
      throw error;
    }
  }

  /**
   * Create a new entity
   * @param entity - Entity data without ID
   * @returns Promise resolving to created entity
   */
  public async create(entity: Omit<T, "id">): Promise<T> {
    try {
      this.logOperation("create", entity);

      if (!entity) {
        throw new Error("Entity cannot be null or undefined");
      }

      const createdEntity = await this.doCreate(entity);
      this.logOperationSuccess("create", entity, createdEntity);
      return createdEntity;
    } catch (error) {
      this.logError("create", error, entity);
      throw error;
    }
  }

  /**
   * Update an existing entity
   * @param id - Entity ID
   * @param entity - Partial entity data for update
   * @returns Promise resolving to updated entity or null if not found
   */
  public async update(id: TId, entity: Partial<T>): Promise<T | null> {
    try {
      this.logOperation("update", { id, entity });

      if (!id) {
        throw new Error("ID cannot be null or undefined");
      }

      if (!entity) {
        throw new Error("Entity cannot be null or undefined");
      }

      const updatedEntity = await this.doUpdate(id, entity);
      this.logOperationSuccess("update", { id, entity }, updatedEntity);
      return updatedEntity;
    } catch (error) {
      this.logError("update", error, { id, entity });
      throw error;
    }
  }

  /**
   * Delete an entity by ID
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating success
   */
  public async delete(id: TId): Promise<boolean> {
    try {
      this.logOperation("delete", { id });

      if (!id) {
        throw new Error("ID cannot be null or undefined");
      }

      const success = await this.doDelete(id);
      this.logOperationSuccess("delete", { id }, success);
      return success;
    } catch (error) {
      this.logError("delete", error, { id });
      throw error;
    }
  }

  /**
   * Check if entity exists
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating existence
   */
  public async exists(id: TId): Promise<boolean> {
    try {
      this.logOperation("exists", { id });

      if (!id) {
        throw new Error("ID cannot be null or undefined");
      }

      const exists = await this.doExists(id);
      this.logOperationSuccess("exists", { id }, exists);
      return exists;
    } catch (error) {
      this.logError("exists", error, { id });
      throw error;
    }
  }

  /**
   * Count total number of entities
   * @returns Promise resolving to total count
   */
  public async count(): Promise<number> {
    try {
      this.logOperation("count", {});

      const count = await this.doCount();
      this.logOperationSuccess("count", {}, count);
      return count;
    } catch (error) {
      this.logError("count", error, {});
      throw error;
    }
  }

  /**
   * Find entities by criteria
   * @param criteria - Search criteria
   * @returns Promise resolving to array of matching entities
   */
  public async findByCriteria(criteria: any): Promise<T[]> {
    try {
      this.logOperation("findByCriteria", criteria);

      if (!criteria) {
        throw new Error("Criteria cannot be null or undefined");
      }

      const entities = await this.doFindByCriteria(criteria);
      this.logOperationSuccess("findByCriteria", criteria, entities);
      return entities;
    } catch (error) {
      this.logError("findByCriteria", error, criteria);
      throw error;
    }
  }

  // Abstract methods to be implemented by derived classes

  /**
   * Performs the actual find by ID operation
   * @param id - Entity ID
   * @returns Promise resolving to entity or null
   */
  protected abstract doFindById(id: TId): Promise<T | null>;

  /**
   * Performs the actual find all operation
   * @returns Promise resolving to array of entities
   */
  protected abstract doFindAll(): Promise<T[]>;

  /**
   * Performs the actual create operation
   * @param entity - Entity data without ID
   * @returns Promise resolving to created entity
   */
  protected abstract doCreate(entity: Omit<T, "id">): Promise<T>;

  /**
   * Performs the actual update operation
   * @param id - Entity ID
   * @param entity - Partial entity data
   * @returns Promise resolving to updated entity or null
   */
  protected abstract doUpdate(id: TId, entity: Partial<T>): Promise<T | null>;

  /**
   * Performs the actual delete operation
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating success
   */
  protected abstract doDelete(id: TId): Promise<boolean>;

  /**
   * Performs the actual exists check operation
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating existence
   */
  protected abstract doExists(id: TId): Promise<boolean>;

  /**
   * Performs the actual count operation
   * @returns Promise resolving to total count
   */
  protected doCount(): Promise<number> {
    // Default implementation - can be overridden
    return this.doFindAll().then((entities) => entities.length);
  }

  /**
   * Performs the actual find by criteria operation
   * @param criteria - Search criteria
   * @returns Promise resolving to array of matching entities
   */
  protected doFindByCriteria(criteria: any): Promise<T[]> {
    // Default implementation - can be overridden
    return this.doFindAll();
  }

  /**
   * Validates entity data before operations
   * @param entity - Entity to validate
   * @returns True if valid, false otherwise
   */
  protected validateEntity(entity: any): boolean {
    return entity !== null && entity !== undefined;
  }

  /**
   * Validates entity ID
   * @param id - ID to validate
   * @returns True if valid, false otherwise
   */
  protected validateId(id: TId): boolean {
    return id !== null && id !== undefined;
  }

  // Logging methods

  /**
   * Logs the start of a repository operation
   * @param operation - The operation name
   * @param params - Operation parameters
   */
  private logOperation(operation: string, params: any): void {
    console.log(
      `[${this.repositoryName}Repository] ${operation}`,
      this.sanitizeForLog(params),
    );
  }

  /**
   * Logs successful operation
   * @param operation - The operation name
   * @param params - Operation parameters
   * @param result - Operation result
   */
  private logOperationSuccess(
    operation: string,
    params: any,
    result: any,
  ): void {
    console.log(`[${this.repositoryName}Repository] ${operation} SUCCESS`, {
      params: this.sanitizeForLog(params),
      result: this.sanitizeForLog(result),
    });
  }

  /**
   * Logs repository error
   * @param operation - The operation name
   * @param error - The error that occurred
   * @param params - Operation parameters
   */
  private logError(operation: string, error: any, params: any): void {
    console.error(`[${this.repositoryName}Repository] ${operation} ERROR`, {
      error: error.message,
      params: this.sanitizeForLog(params),
    });
  }

  /**
   * Sanitizes data for logging
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  private sanitizeForLog(data: any): any {
    if (typeof data === "string") {
      return data.length > 100 ? `${data.substring(0, 100)}...` : data;
    }
    if (typeof data === "object" && data !== null) {
      return "[Object]";
    }
    return data;
  }
}
