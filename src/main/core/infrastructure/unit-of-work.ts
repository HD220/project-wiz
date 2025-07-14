import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { TransactionManager, type TransactionOptions, type TransactionResult } from "./transaction-manager";
import { DatabaseManager } from "./database-manager";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { InternalError } from "../errors/internal-error";
import { Entity } from "../abstractions/entity.type";
import { allTables, allRelations } from "../../persistence/schemas";

/**
 * Unit of Work operation type
 */
export enum UnitOfWorkOperationType {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  CUSTOM = "CUSTOM",
}

/**
 * Unit of Work operation interface
 */
export interface UnitOfWorkOperation<TEntity = any> {
  /** Operation type */
  readonly type: UnitOfWorkOperationType;
  /** Entity involved in the operation */
  readonly entity?: TEntity;
  /** Entity ID for delete operations */
  readonly entityId?: string;
  /** Table for the operation */
  readonly table: any;
  /** Custom operation function */
  readonly customOperation?: (db: BetterSQLite3Database<typeof allTables & typeof allRelations>) => Promise<any>;
  /** Operation metadata */
  readonly metadata?: Record<string, any>;
}

/**
 * Unit of Work result interface
 */
export interface UnitOfWorkResult {
  /** Operation results */
  readonly results: any[];
  /** Total operations executed */
  readonly operationCount: number;
  /** Execution time in milliseconds */
  readonly executionTime: number;
  /** Success status */
  readonly success: boolean;
}

/**
 * Unit of Work context interface
 */
export interface UnitOfWorkContext {
  /** Context ID */
  readonly id: string;
  /** Start timestamp */
  readonly startTime: Date;
  /** Operations to execute */
  readonly operations: UnitOfWorkOperation[];
  /** Transaction options */
  readonly transactionOptions: TransactionOptions;
  /** Context metadata */
  readonly metadata: Record<string, any>;
}

/**
 * Unit of Work pattern implementation for Drizzle ORM
 * Manages multiple repository operations within a single transaction
 */
export class UnitOfWork {
  private static instance: UnitOfWork | null = null;
  private readonly logger: Logger;
  private readonly databaseManager: DatabaseManager;
  private readonly transactionManager: TransactionManager;
  private readonly operations: UnitOfWorkOperation[] = [];
  private contextCounter = 0;
  private isActive = false;
  private currentContext: UnitOfWorkContext | null = null;

  private constructor() {
    this.logger = Logger.create("UnitOfWork");
    this.databaseManager = DatabaseManager.getInstance();
    this.transactionManager = TransactionManager.getInstance();
  }

  /**
   * Get singleton instance of UnitOfWork
   */
  public static getInstance(): UnitOfWork {
    if (!UnitOfWork.instance) {
      UnitOfWork.instance = new UnitOfWork();
    }
    return UnitOfWork.instance;
  }

  /**
   * Start a new unit of work
   */
  public begin(
    transactionOptions: TransactionOptions = {},
    metadata: Record<string, any> = {}
  ): Result<string, InternalError> {
    try {
      if (this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is already active",
            "UNIT_OF_WORK_ALREADY_ACTIVE"
          )
        );
      }

      const contextId = this.generateContextId();
      
      this.currentContext = {
        id: contextId,
        startTime: new Date(),
        operations: [],
        transactionOptions,
        metadata,
      };

      this.isActive = true;
      this.operations.length = 0; // Clear previous operations

      this.logger.debug("Unit of Work started", {
        contextId,
        transactionOptions,
        metadata,
      });

      return Result.ok(contextId);

    } catch (error) {
      this.logger.error("Failed to start Unit of Work", { error });
      return Result.fail(
        new InternalError(
          "Failed to start Unit of Work",
          "UNIT_OF_WORK_START_FAILED",
          error
        )
      );
    }
  }

  /**
   * Register an insert operation
   */
  public registerInsert<TEntity extends Entity<any>>(
    entity: TEntity,
    table: any,
    metadata?: Record<string, any>
  ): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active. Call begin() first.",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      const operation: UnitOfWorkOperation<TEntity> = {
        type: UnitOfWorkOperationType.INSERT,
        entity,
        table,
        metadata,
      };

      this.operations.push(operation);

      this.logger.debug("Insert operation registered", {
        entityId: entity.getId(),
        table: table._.name,
        operationCount: this.operations.length,
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to register insert operation", { error });
      return Result.fail(
        new InternalError(
          "Failed to register insert operation",
          "REGISTER_INSERT_FAILED",
          error
        )
      );
    }
  }

  /**
   * Register an update operation
   */
  public registerUpdate<TEntity extends Entity<any>>(
    entity: TEntity,
    table: any,
    metadata?: Record<string, any>
  ): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active. Call begin() first.",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      const operation: UnitOfWorkOperation<TEntity> = {
        type: UnitOfWorkOperationType.UPDATE,
        entity,
        table,
        metadata,
      };

      this.operations.push(operation);

      this.logger.debug("Update operation registered", {
        entityId: entity.getId(),
        table: table._.name,
        operationCount: this.operations.length,
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to register update operation", { error });
      return Result.fail(
        new InternalError(
          "Failed to register update operation",
          "REGISTER_UPDATE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Register a delete operation
   */
  public registerDelete(
    entityId: string,
    table: any,
    metadata?: Record<string, any>
  ): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active. Call begin() first.",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      const operation: UnitOfWorkOperation = {
        type: UnitOfWorkOperationType.DELETE,
        entityId,
        table,
        metadata,
      };

      this.operations.push(operation);

      this.logger.debug("Delete operation registered", {
        entityId,
        table: table._.name,
        operationCount: this.operations.length,
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to register delete operation", { error });
      return Result.fail(
        new InternalError(
          "Failed to register delete operation",
          "REGISTER_DELETE_FAILED",
          error
        )
      );
    }
  }

  /**
   * Register a custom operation
   */
  public registerCustom(
    customOperation: (db: BetterSQLite3Database<typeof allTables & typeof allRelations>) => Promise<any>,
    metadata?: Record<string, any>
  ): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active. Call begin() first.",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      const operation: UnitOfWorkOperation = {
        type: UnitOfWorkOperationType.CUSTOM,
        customOperation,
        table: null,
        metadata,
      };

      this.operations.push(operation);

      this.logger.debug("Custom operation registered", {
        operationCount: this.operations.length,
        metadata,
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to register custom operation", { error });
      return Result.fail(
        new InternalError(
          "Failed to register custom operation",
          "REGISTER_CUSTOM_FAILED",
          error
        )
      );
    }
  }

  /**
   * Commit all operations in a transaction
   */
  public async commit(): Promise<Result<UnitOfWorkResult, InternalError>> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active. Call begin() first.",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      if (this.operations.length === 0) {
        this.logger.warn("No operations to commit");
        
        const result: UnitOfWorkResult = {
          results: [],
          operationCount: 0,
          executionTime: 0,
          success: true,
        };

        this.cleanup();
        return Result.ok(result);
      }

      this.logger.info("Committing Unit of Work", {
        contextId: this.currentContext?.id,
        operationCount: this.operations.length,
      });

      const startTime = Date.now();

      // Execute all operations within a single transaction
      const transactionResult = await this.transactionManager.executeTransaction(
        async (db) => {
          const results: any[] = [];

          for (const operation of this.operations) {
            const operationResult = await this.executeOperation(operation, db);
            results.push(operationResult);
          }

          return results;
        },
        this.currentContext?.transactionOptions
      );

      if (transactionResult.isFailure()) {
        this.cleanup();
        return Result.fail(transactionResult.error);
      }

      const executionTime = Date.now() - startTime;

      const result: UnitOfWorkResult = {
        results: transactionResult.value.value,
        operationCount: this.operations.length,
        executionTime,
        success: true,
      };

      this.logger.info("Unit of Work committed successfully", {
        contextId: this.currentContext?.id,
        operationCount: this.operations.length,
        executionTime,
      });

      this.cleanup();
      return Result.ok(result);

    } catch (error) {
      this.logger.error("Failed to commit Unit of Work", { error });
      this.cleanup();
      
      return Result.fail(
        new InternalError(
          "Failed to commit Unit of Work",
          "UNIT_OF_WORK_COMMIT_FAILED",
          error
        )
      );
    }
  }

  /**
   * Rollback and clear all operations
   */
  public rollback(): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      this.logger.warn("Rolling back Unit of Work", {
        contextId: this.currentContext?.id,
        operationCount: this.operations.length,
      });

      this.cleanup();
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to rollback Unit of Work", { error });
      return Result.fail(
        new InternalError(
          "Failed to rollback Unit of Work",
          "UNIT_OF_WORK_ROLLBACK_FAILED",
          error
        )
      );
    }
  }

  /**
   * Execute individual operation
   */
  private async executeOperation(
    operation: UnitOfWorkOperation,
    db: BetterSQLite3Database<typeof allTables & typeof allRelations>
  ): Promise<any> {
    this.logger.debug("Executing operation", {
      type: operation.type,
      table: operation.table?._.name,
    });

    switch (operation.type) {
      case UnitOfWorkOperationType.INSERT:
        if (!operation.entity || !operation.table) {
          throw new Error("Entity and table are required for INSERT operation");
        }
        const insertResult = await db.insert(operation.table).values(operation.entity).returning();
        return insertResult[0];

      case UnitOfWorkOperationType.UPDATE:
        if (!operation.entity || !operation.table) {
          throw new Error("Entity and table are required for UPDATE operation");
        }
        const updateResult = await db
          .update(operation.table)
          .set(operation.entity)
          .where(eq(operation.table.id, (operation.entity as any).id))
          .returning();
        return updateResult[0];

      case UnitOfWorkOperationType.DELETE:
        if (!operation.entityId || !operation.table) {
          throw new Error("Entity ID and table are required for DELETE operation");
        }
        const deleteResult = await db
          .delete(operation.table)
          .where(eq(operation.table.id, operation.entityId))
          .returning();
        return deleteResult[0];

      case UnitOfWorkOperationType.CUSTOM:
        if (!operation.customOperation) {
          throw new Error("Custom operation function is required for CUSTOM operation");
        }
        return await operation.customOperation(db);

      default:
        throw new Error(`Unsupported operation type: ${operation.type}`);
    }
  }

  /**
   * Get current Unit of Work status
   */
  public getStatus(): {
    readonly isActive: boolean;
    readonly operationCount: number;
    readonly context: UnitOfWorkContext | null;
  } {
    return {
      isActive: this.isActive,
      operationCount: this.operations.length,
      context: this.currentContext,
    };
  }

  /**
   * Get registered operations
   */
  public getOperations(): readonly UnitOfWorkOperation[] {
    return [...this.operations];
  }

  /**
   * Clear specific operation by index
   */
  public clearOperation(index: number): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      if (index < 0 || index >= this.operations.length) {
        return Result.fail(
          new InternalError(
            "Invalid operation index",
            "INVALID_OPERATION_INDEX"
          )
        );
      }

      this.operations.splice(index, 1);
      
      this.logger.debug("Operation cleared", {
        index,
        remainingCount: this.operations.length,
      });

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to clear operation", { index, error });
      return Result.fail(
        new InternalError(
          "Failed to clear operation",
          "CLEAR_OPERATION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Clear all operations without committing
   */
  public clearAll(): Result<void, InternalError> {
    try {
      if (!this.isActive) {
        return Result.fail(
          new InternalError(
            "Unit of Work is not active",
            "UNIT_OF_WORK_NOT_ACTIVE"
          )
        );
      }

      const clearedCount = this.operations.length;
      this.operations.length = 0;

      this.logger.debug("All operations cleared", { clearedCount });
      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to clear all operations", { error });
      return Result.fail(
        new InternalError(
          "Failed to clear all operations",
          "CLEAR_ALL_OPERATIONS_FAILED",
          error
        )
      );
    }
  }

  /**
   * Generate unique context ID
   */
  private generateContextId(): string {
    this.contextCounter++;
    return `uow_${Date.now()}_${this.contextCounter}`;
  }

  /**
   * Cleanup Unit of Work state
   */
  private cleanup(): void {
    this.isActive = false;
    this.operations.length = 0;
    this.currentContext = null;
  }
}