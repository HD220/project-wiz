import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { DatabaseManager } from "./database-manager";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { InternalError } from "../errors/internal-error";
import { allTables, allRelations } from "../../persistence/schemas";

/**
 * Transaction isolation levels
 */
export enum TransactionIsolationLevel {
  READ_UNCOMMITTED = "READ UNCOMMITTED",
  READ_COMMITTED = "READ COMMITTED",
  REPEATABLE_READ = "REPEATABLE READ",
  SERIALIZABLE = "SERIALIZABLE",
}

/**
 * Transaction options interface
 */
export interface TransactionOptions {
  /** Transaction isolation level */
  readonly isolationLevel?: TransactionIsolationLevel;
  /** Transaction timeout in milliseconds */
  readonly timeout?: number;
  /** Read-only transaction */
  readonly readOnly?: boolean;
  /** Retry attempts on failure */
  readonly retryAttempts?: number;
  /** Retry delay in milliseconds */
  readonly retryDelay?: number;
}

/**
 * Transaction status enumeration
 */
export enum TransactionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  COMMITTED = "COMMITTED",
  ROLLED_BACK = "ROLLED_BACK",
  FAILED = "FAILED",
}

/**
 * Transaction context interface
 */
export interface TransactionContext {
  /** Transaction ID */
  readonly id: string;
  /** Transaction status */
  readonly status: TransactionStatus;
  /** Start timestamp */
  readonly startTime: Date;
  /** End timestamp */
  readonly endTime?: Date;
  /** Transaction options */
  readonly options: TransactionOptions;
  /** Database instance */
  readonly db: BetterSQLite3Database<typeof allTables & typeof allRelations>;
}

/**
 * Transaction result interface
 */
export interface TransactionResult<T> {
  /** Result value */
  readonly value: T;
  /** Transaction context */
  readonly context: TransactionContext;
  /** Execution time in milliseconds */
  readonly executionTime: number;
}

/**
 * Transaction manager for Drizzle ORM operations
 * Provides transaction control, isolation levels, and retry logic
 */
export class TransactionManager {
  private static instance: TransactionManager | null = null;
  private readonly logger: Logger;
  private readonly databaseManager: DatabaseManager;
  private activeTransactions: Map<string, TransactionContext> = new Map();
  private transactionCounter = 0;

  private constructor() {
    this.logger = Logger.create("TransactionManager");
    this.databaseManager = DatabaseManager.getInstance();
  }

  /**
   * Get singleton instance of TransactionManager
   */
  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  /**
   * Execute operation within a transaction
   */
  public async executeTransaction<T>(
    operation: (db: BetterSQLite3Database<typeof allTables & typeof allRelations>) => Promise<T> | T,
    options: TransactionOptions = {}
  ): Promise<Result<TransactionResult<T>, InternalError>> {
    const startTime = new Date();
    const transactionId = this.generateTransactionId();
    
    try {
      const db = this.databaseManager.getDatabase();
      
      const transactionOptions: TransactionOptions = {
        isolationLevel: options.isolationLevel || TransactionIsolationLevel.READ_COMMITTED,
        timeout: options.timeout || 30000,
        readOnly: options.readOnly || false,
        retryAttempts: options.retryAttempts || 3,
        retryDelay: options.retryDelay || 1000,
      };

      this.logger.debug("Starting transaction", {
        transactionId,
        options: transactionOptions,
      });

      // Create transaction context
      const context: TransactionContext = {
        id: transactionId,
        status: TransactionStatus.PENDING,
        startTime,
        options: transactionOptions,
        db,
      };

      this.activeTransactions.set(transactionId, context);

      // Execute with retry logic
      const result = await this.executeWithRetry(
        operation,
        context,
        transactionOptions.retryAttempts!
      );

      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();

      // Update context status
      const finalContext: TransactionContext = {
        ...context,
        status: TransactionStatus.COMMITTED,
        endTime,
      };

      this.activeTransactions.set(transactionId, finalContext);
      this.databaseManager.recordTransaction();

      this.logger.debug("Transaction completed successfully", {
        transactionId,
        executionTime,
      });

      // Clean up
      this.activeTransactions.delete(transactionId);

      return Result.ok({
        value: result,
        context: finalContext,
        executionTime,
      });

    } catch (error) {
      this.logger.error("Transaction failed", {
        transactionId,
        error,
      });

      // Update context status
      const failedContext = this.activeTransactions.get(transactionId);
      if (failedContext) {
        this.activeTransactions.set(transactionId, {
          ...failedContext,
          status: TransactionStatus.FAILED,
          endTime: new Date(),
        });
      }

      // Clean up
      this.activeTransactions.delete(transactionId);

      return Result.fail(
        new InternalError(
          "Transaction execution failed",
          "TRANSACTION_EXECUTION_FAILED",
          error
        )
      );
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: (db: BetterSQLite3Database<typeof allTables & typeof allRelations>) => Promise<T> | T,
    context: TransactionContext,
    retryAttempts: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        this.logger.debug("Executing transaction attempt", {
          transactionId: context.id,
          attempt,
          maxAttempts: retryAttempts,
        });

        // Update context status
        this.activeTransactions.set(context.id, {
          ...context,
          status: TransactionStatus.ACTIVE,
        });

        // Execute the operation within a transaction
        const result = await context.db.transaction(async (tx) => {
          // Set isolation level if specified
          if (context.options.isolationLevel) {
            await tx.run(`PRAGMA read_uncommitted = ${
              context.options.isolationLevel === TransactionIsolationLevel.READ_UNCOMMITTED ? 'ON' : 'OFF'
            }`);
          }

          // Execute the actual operation
          return await operation(tx);
        });

        this.logger.debug("Transaction attempt succeeded", {
          transactionId: context.id,
          attempt,
        });

        return result;

      } catch (error) {
        lastError = error as Error;
        
        this.logger.warn("Transaction attempt failed", {
          transactionId: context.id,
          attempt,
          error: lastError.message,
        });

        // Update context status
        this.activeTransactions.set(context.id, {
          ...context,
          status: TransactionStatus.ROLLED_BACK,
        });

        // If this was the last attempt, throw the error
        if (attempt === retryAttempts) {
          throw lastError;
        }

        // Wait before retrying
        if (context.options.retryDelay && context.options.retryDelay > 0) {
          await this.delay(context.options.retryDelay);
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error("Transaction failed after all retry attempts");
  }

  /**
   * Execute read-only transaction
   */
  public async executeReadOnlyTransaction<T>(
    operation: (db: BetterSQLite3Database<typeof allTables & typeof allRelations>) => Promise<T> | T,
    options: Omit<TransactionOptions, 'readOnly'> = {}
  ): Promise<Result<TransactionResult<T>, InternalError>> {
    return this.executeTransaction(operation, {
      ...options,
      readOnly: true,
    });
  }

  /**
   * Get active transaction by ID
   */
  public getActiveTransaction(transactionId: string): TransactionContext | undefined {
    return this.activeTransactions.get(transactionId);
  }

  /**
   * Get all active transactions
   */
  public getActiveTransactions(): TransactionContext[] {
    return Array.from(this.activeTransactions.values());
  }

  /**
   * Get transaction statistics
   */
  public getTransactionStats(): {
    readonly activeCount: number;
    readonly totalCount: number;
  } {
    return {
      activeCount: this.activeTransactions.size,
      totalCount: this.transactionCounter,
    };
  }

  /**
   * Cancel transaction by ID
   */
  public async cancelTransaction(transactionId: string): Promise<Result<void, InternalError>> {
    try {
      const context = this.activeTransactions.get(transactionId);
      
      if (!context) {
        return Result.fail(
          new InternalError(
            `Transaction not found: ${transactionId}`,
            "TRANSACTION_NOT_FOUND"
          )
        );
      }

      if (context.status !== TransactionStatus.ACTIVE) {
        return Result.fail(
          new InternalError(
            `Transaction is not active: ${transactionId}`,
            "TRANSACTION_NOT_ACTIVE"
          )
        );
      }

      this.logger.warn("Cancelling transaction", { transactionId });

      // Update context status
      this.activeTransactions.set(transactionId, {
        ...context,
        status: TransactionStatus.ROLLED_BACK,
        endTime: new Date(),
      });

      // Clean up
      this.activeTransactions.delete(transactionId);

      return Result.ok(undefined);

    } catch (error) {
      this.logger.error("Failed to cancel transaction", {
        transactionId,
        error,
      });

      return Result.fail(
        new InternalError(
          "Failed to cancel transaction",
          "TRANSACTION_CANCEL_FAILED",
          error
        )
      );
    }
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    this.transactionCounter++;
    return `tx_${Date.now()}_${this.transactionCounter}`;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up completed transactions older than specified duration
   */
  public cleanupCompletedTransactions(olderThanMs: number = 3600000): void {
    const cutoffTime = new Date(Date.now() - olderThanMs);
    
    for (const [id, context] of this.activeTransactions.entries()) {
      if (
        context.endTime &&
        context.endTime < cutoffTime &&
        (context.status === TransactionStatus.COMMITTED || 
         context.status === TransactionStatus.ROLLED_BACK ||
         context.status === TransactionStatus.FAILED)
      ) {
        this.activeTransactions.delete(id);
      }
    }

    this.logger.debug("Cleaned up completed transactions", {
      cutoffTime,
      remainingCount: this.activeTransactions.size,
    });
  }
}