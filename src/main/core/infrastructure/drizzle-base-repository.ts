import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and, or, inArray, SQL } from "drizzle-orm";
import { DatabaseManager } from "./database-manager";
import { TransactionManager } from "./transaction-manager";
import { DrizzleQueryBuilder, type QueryOptions, type PaginatedResult } from "./drizzle-query-builder";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { NotFoundError } from "../errors/not-found-error";
import { ConflictError } from "../errors/conflict-error";
import { ValidationError } from "../errors/validation-error";
import { InternalError } from "../errors/internal-error";
import { BaseRepository } from "../base/base-repository";
import { Entity } from "../abstractions/entity.type";
import { allTables, allRelations } from "../../persistence/schemas";

/**
 * Repository options interface
 */
export interface RepositoryOptions {
  /** Enable soft delete */
  readonly softDelete?: boolean;
  /** Enable auditing */
  readonly auditing?: boolean;
  /** Enable caching */
  readonly caching?: boolean;
  /** Cache TTL in milliseconds */
  readonly cacheTtl?: number;
}

/**
 * Bulk operation options interface
 */
export interface BulkOptions {
  /** Batch size for bulk operations */
  readonly batchSize?: number;
  /** Continue on error */
  readonly continueOnError?: boolean;
  /** Return results */
  readonly returnResults?: boolean;
}

/**
 * Bulk operation result interface
 */
export interface BulkResult<T> {
  /** Successfully processed items */
  readonly success: T[];
  /** Failed items with errors */
  readonly failed: Array<{ item: T; error: string }>;
  /** Total processed count */
  readonly totalProcessed: number;
  /** Success count */
  readonly successCount: number;
  /** Failed count */
  readonly failedCount: number;
}

/**
 * Generic base repository implementation using Drizzle ORM
 * Provides CRUD operations, query building, and transaction support
 */
export abstract class DrizzleBaseRepository<TEntity extends Entity<TId>, TId = string>
  extends BaseRepository<TEntity, TId> {
  
  protected readonly db: BetterSQLite3Database<typeof allTables & typeof allRelations>;
  protected readonly transactionManager: TransactionManager;
  protected readonly queryBuilder: DrizzleQueryBuilder;
  protected readonly logger: Logger;
  protected readonly options: RepositoryOptions;

  constructor(
    protected readonly table: any,
    protected readonly entityName: string,
    options: RepositoryOptions = {}
  ) {
    super();
    
    const databaseManager = DatabaseManager.getInstance();
    this.db = databaseManager.getDatabase();
    this.transactionManager = TransactionManager.getInstance();
    this.queryBuilder = new DrizzleQueryBuilder();
    this.logger = Logger.create(`${entityName}Repository`);
    
    this.options = {
      softDelete: false,
      auditing: false,
      caching: false,
      cacheTtl: 300000, // 5 minutes
      ...options,
    };
  }

  /**
   * Abstract methods to be implemented by concrete repositories
   */
  protected abstract toDomain(dbEntity: any): TEntity;
  protected abstract toPersistence(entity: TEntity): any;
  protected abstract validateForCreate(entity: TEntity): Result<void, ValidationError>;
  protected abstract validateForUpdate(entity: TEntity): Result<void, ValidationError>;

  /**
   * Find entity by ID
   */
  public async findById(id: TId): Promise<Result<TEntity | null, InternalError>> {
    try {
      this.logger.debug(`Finding ${this.entityName} by ID`, { id });

      const startTime = Date.now();
      
      const result = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);

      const executionTime = Date.now() - startTime;
      this.logger.debug(`${this.entityName} query completed`, { 
        id, 
        found: result.length > 0,
        executionTime 
      });

      if (result.length === 0) {
        return Result.ok(null);
      }

      const entity = this.toDomain(result[0]);
      return Result.ok(entity);

    } catch (error) {
      this.logger.error(`Failed to find ${this.entityName} by ID`, { id, error });
      return Result.fail(
        new InternalError(
          `Failed to find ${this.entityName}`,
          "REPOSITORY_FIND_BY_ID_FAILED",
          error
        )
      );
    }
  }

  /**
   * Find all entities with options
   */
  public async findAll(options: QueryOptions = {}): Promise<Result<TEntity[], InternalError>> {
    try {
      this.logger.debug(`Finding all ${this.entityName}`, { options });

      const queryResult = await this.queryBuilder.query(this.table, options);
      
      if (queryResult.isFailure()) {
        return Result.fail(queryResult.error);
      }

      const entities = queryResult.value.map(item => this.toDomain(item));
      
      this.logger.debug(`Found ${entities.length} ${this.entityName} entities`);
      return Result.ok(entities);

    } catch (error) {
      this.logger.error(`Failed to find all ${this.entityName}`, { error });
      return Result.fail(
        new InternalError(
          `Failed to find all ${this.entityName}`,
          "REPOSITORY_FIND_ALL_FAILED",
          error
        )
      );
    }
  }

  /**
   * Find entities with pagination
   */
  public async findPaginated(
    options: QueryOptions & { pagination: { page: number; limit: number } }
  ): Promise<Result<PaginatedResult<TEntity>, InternalError>> {
    try {
      this.logger.debug(`Finding paginated ${this.entityName}`, { options });

      const queryResult = await this.queryBuilder.queryPaginated(this.table, options);
      
      if (queryResult.isFailure()) {
        return Result.fail(queryResult.error);
      }

      const paginatedResult = {
        ...queryResult.value,
        data: queryResult.value.data.map(item => this.toDomain(item)),
      };

      this.logger.debug(`Found ${paginatedResult.data.length} ${this.entityName} entities (paginated)`);
      return Result.ok(paginatedResult);

    } catch (error) {
      this.logger.error(`Failed to find paginated ${this.entityName}`, { error });
      return Result.fail(
        new InternalError(
          `Failed to find paginated ${this.entityName}`,
          "REPOSITORY_FIND_PAGINATED_FAILED",
          error
        )
      );
    }
  }

  /**
   * Create new entity
   */
  public async create(entity: TEntity): Promise<Result<TEntity, ValidationError | ConflictError | InternalError>> {
    try {
      this.logger.debug(`Creating ${this.entityName}`, { entityId: entity.getId() });

      // Validate entity
      const validationResult = this.validateForCreate(entity);
      if (validationResult.isFailure()) {
        return Result.fail(validationResult.error);
      }

      // Check if entity already exists
      const existingResult = await this.findById(entity.getId());
      if (existingResult.isFailure()) {
        return Result.fail(existingResult.error);
      }
      
      if (existingResult.value !== null) {
        return Result.fail(
          new ConflictError(
            `${this.entityName} already exists`,
            "ENTITY_ALREADY_EXISTS"
          )
        );
      }

      // Convert to persistence format
      const persistenceData = this.toPersistence(entity);

      // Execute within transaction
      const transactionResult = await this.transactionManager.executeTransaction(async (tx) => {
        const result = await tx.insert(this.table).values(persistenceData).returning();
        return result[0];
      });

      if (transactionResult.isFailure()) {
        return Result.fail(transactionResult.error);
      }

      const createdEntity = this.toDomain(transactionResult.value.value);
      
      this.logger.info(`${this.entityName} created successfully`, { 
        entityId: createdEntity.getId() 
      });

      return Result.ok(createdEntity);

    } catch (error) {
      this.logger.error(`Failed to create ${this.entityName}`, { 
        entityId: entity.getId(), 
        error 
      });
      
      return Result.fail(
        new InternalError(
          `Failed to create ${this.entityName}`,
          "REPOSITORY_CREATE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Update existing entity
   */
  public async update(entity: TEntity): Promise<Result<TEntity, ValidationError | NotFoundError | InternalError>> {
    try {
      this.logger.debug(`Updating ${this.entityName}`, { entityId: entity.getId() });

      // Validate entity
      const validationResult = this.validateForUpdate(entity);
      if (validationResult.isFailure()) {
        return Result.fail(validationResult.error);
      }

      // Check if entity exists
      const existingResult = await this.findById(entity.getId());
      if (existingResult.isFailure()) {
        return Result.fail(existingResult.error);
      }
      
      if (existingResult.value === null) {
        return Result.fail(
          new NotFoundError(
            `${this.entityName} not found`,
            "ENTITY_NOT_FOUND"
          )
        );
      }

      // Convert to persistence format
      const persistenceData = this.toPersistence(entity);

      // Execute within transaction
      const transactionResult = await this.transactionManager.executeTransaction(async (tx) => {
        const result = await tx
          .update(this.table)
          .set(persistenceData)
          .where(eq(this.table.id, entity.getId()))
          .returning();
        
        return result[0];
      });

      if (transactionResult.isFailure()) {
        return Result.fail(transactionResult.error);
      }

      const updatedEntity = this.toDomain(transactionResult.value.value);
      
      this.logger.info(`${this.entityName} updated successfully`, { 
        entityId: updatedEntity.getId() 
      });

      return Result.ok(updatedEntity);

    } catch (error) {
      this.logger.error(`Failed to update ${this.entityName}`, { 
        entityId: entity.getId(), 
        error 
      });
      
      return Result.fail(
        new InternalError(
          `Failed to update ${this.entityName}`,
          "REPOSITORY_UPDATE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Delete entity by ID
   */
  public async delete(id: TId): Promise<Result<void, NotFoundError | InternalError>> {
    try {
      this.logger.debug(`Deleting ${this.entityName}`, { id });

      // Check if entity exists
      const existingResult = await this.findById(id);
      if (existingResult.isFailure()) {
        return Result.fail(existingResult.error);
      }
      
      if (existingResult.value === null) {
        return Result.fail(
          new NotFoundError(
            `${this.entityName} not found`,
            "ENTITY_NOT_FOUND"
          )
        );
      }

      // Execute within transaction
      const transactionResult = await this.transactionManager.executeTransaction(async (tx) => {
        if (this.options.softDelete) {
          // Soft delete - update deleted_at field
          await tx
            .update(this.table)
            .set({ deletedAt: new Date() })
            .where(eq(this.table.id, id));
        } else {
          // Hard delete - remove from database
          await tx
            .delete(this.table)
            .where(eq(this.table.id, id));
        }
      });

      if (transactionResult.isFailure()) {
        return Result.fail(transactionResult.error);
      }

      this.logger.info(`${this.entityName} deleted successfully`, { id });
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error(`Failed to delete ${this.entityName}`, { id, error });
      
      return Result.fail(
        new InternalError(
          `Failed to delete ${this.entityName}`,
          "REPOSITORY_DELETE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Check if entity exists by ID
   */
  public async exists(id: TId): Promise<Result<boolean, InternalError>> {
    try {
      this.logger.debug(`Checking if ${this.entityName} exists`, { id });

      const result = await this.db
        .select({ id: this.table.id })
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);

      return Result.ok(result.length > 0);

    } catch (error) {
      this.logger.error(`Failed to check if ${this.entityName} exists`, { id, error });
      
      return Result.fail(
        new InternalError(
          `Failed to check if ${this.entityName} exists`,
          "REPOSITORY_EXISTS_FAILED",
          error
        )
      );
    }
  }

  /**
   * Count entities with optional conditions
   */
  public async count(options: QueryOptions = {}): Promise<Result<number, InternalError>> {
    try {
      this.logger.debug(`Counting ${this.entityName}`, { options });

      // Use query builder for consistent condition handling
      const queryResult = await this.queryBuilder.aggregate(this.table, {
        function: "count" as any,
        column: "id",
        where: options.conditions,
      });

      if (queryResult.isFailure()) {
        return Result.fail(queryResult.error);
      }

      const count = queryResult.value[0]?.count || 0;
      return Result.ok(count);

    } catch (error) {
      this.logger.error(`Failed to count ${this.entityName}`, { error });
      
      return Result.fail(
        new InternalError(
          `Failed to count ${this.entityName}`,
          "REPOSITORY_COUNT_FAILED",
          error
        )
      );
    }
  }

  /**
   * Bulk create entities
   */
  public async bulkCreate(
    entities: TEntity[], 
    options: BulkOptions = {}
  ): Promise<Result<BulkResult<TEntity>, InternalError>> {
    try {
      this.logger.debug(`Bulk creating ${entities.length} ${this.entityName}`, { options });

      const batchSize = options.batchSize || 100;
      const continueOnError = options.continueOnError || false;
      
      const success: TEntity[] = [];
      const failed: Array<{ item: TEntity; error: string }> = [];

      // Process in batches
      for (let i = 0; i < entities.length; i += batchSize) {
        const batch = entities.slice(i, i + batchSize);
        
        const transactionResult = await this.transactionManager.executeTransaction(async (tx) => {
          const results: TEntity[] = [];
          
          for (const entity of batch) {
            try {
              // Validate entity
              const validationResult = this.validateForCreate(entity);
              if (validationResult.isFailure()) {
                throw new Error(validationResult.error.message);
              }

              // Convert to persistence format
              const persistenceData = this.toPersistence(entity);

              // Insert entity
              const result = await tx.insert(this.table).values(persistenceData).returning();
              const createdEntity = this.toDomain(result[0]);
              results.push(createdEntity);

            } catch (error) {
              if (!continueOnError) {
                throw error;
              }
              failed.push({ 
                item: entity, 
                error: error instanceof Error ? error.message : String(error) 
              });
            }
          }
          
          return results;
        });

        if (transactionResult.isFailure()) {
          if (!continueOnError) {
            return Result.fail(transactionResult.error);
          }
          // Add all batch items to failed
          batch.forEach(entity => {
            failed.push({ item: entity, error: transactionResult.error.message });
          });
        } else {
          success.push(...transactionResult.value.value);
        }
      }

      const result: BulkResult<TEntity> = {
        success,
        failed,
        totalProcessed: entities.length,
        successCount: success.length,
        failedCount: failed.length,
      };

      this.logger.info(`Bulk create completed`, {
        entityName: this.entityName,
        total: entities.length,
        success: success.length,
        failed: failed.length,
      });

      return Result.ok(result);

    } catch (error) {
      this.logger.error(`Bulk create failed`, { 
        entityName: this.entityName,
        entityCount: entities.length,
        error 
      });
      
      return Result.fail(
        new InternalError(
          `Bulk create ${this.entityName} failed`,
          "REPOSITORY_BULK_CREATE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Bulk delete entities by IDs
   */
  public async bulkDelete(
    ids: TId[], 
    options: BulkOptions = {}
  ): Promise<Result<BulkResult<TId>, InternalError>> {
    try {
      this.logger.debug(`Bulk deleting ${ids.length} ${this.entityName}`, { options });

      const batchSize = options.batchSize || 100;
      const continueOnError = options.continueOnError || false;
      
      const success: TId[] = [];
      const failed: Array<{ item: TId; error: string }> = [];

      // Process in batches
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        
        const transactionResult = await this.transactionManager.executeTransaction(async (tx) => {
          if (this.options.softDelete) {
            // Soft delete
            await tx
              .update(this.table)
              .set({ deletedAt: new Date() })
              .where(inArray(this.table.id, batch));
          } else {
            // Hard delete
            await tx
              .delete(this.table)
              .where(inArray(this.table.id, batch));
          }
          
          return batch;
        });

        if (transactionResult.isFailure()) {
          if (!continueOnError) {
            return Result.fail(transactionResult.error);
          }
          // Add all batch items to failed
          batch.forEach(id => {
            failed.push({ item: id, error: transactionResult.error.message });
          });
        } else {
          success.push(...transactionResult.value.value);
        }
      }

      const result: BulkResult<TId> = {
        success,
        failed,
        totalProcessed: ids.length,
        successCount: success.length,
        failedCount: failed.length,
      };

      this.logger.info(`Bulk delete completed`, {
        entityName: this.entityName,
        total: ids.length,
        success: success.length,
        failed: failed.length,
      });

      return Result.ok(result);

    } catch (error) {
      this.logger.error(`Bulk delete failed`, { 
        entityName: this.entityName,
        idCount: ids.length,
        error 
      });
      
      return Result.fail(
        new InternalError(
          `Bulk delete ${this.entityName} failed`,
          "REPOSITORY_BULK_DELETE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Get repository statistics
   */
  public getStats(): {
    readonly entityName: string;
    readonly options: RepositoryOptions;
    readonly queryStats: any;
  } {
    return {
      entityName: this.entityName,
      options: this.options,
      queryStats: this.queryBuilder.getQueryStats(),
    };
  }
}