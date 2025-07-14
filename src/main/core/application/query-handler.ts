import { IQuery, IQueryHandler } from "../abstractions/query.interface";
import { Result } from "../abstractions/result.type";
import { Logger } from "../infrastructure/logger";

/**
 * Abstract base class for query handlers
 * Provides common functionality for CQRS query processing
 *
 * @template TQuery - Type of query to handle
 * @template TResult - Type of query result
 */
export abstract class BaseQueryHandler<TQuery extends IQuery<TResult>, TResult>
  implements IQueryHandler<TQuery, TResult>
{
  protected readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Handle the query execution
   * Template method that includes logging and error handling
   * @param query - Query to handle
   * @returns Promise resolving to Result with query result or error
   */
  public async handle(query: TQuery): Promise<Result<TResult, Error>> {
    const queryType = this.getQueryType();
    const startTime = Date.now();

    try {
      this.logger.debug(`QueryHandler: Processing query: ${queryType}`, {
        queryId: (query as any).queryId,
        startTime: new Date(startTime).toISOString(),
      });

      // Validate query if validation is implemented
      const validationResult = await this.validateQuery(query);
      if (validationResult.isFailure) {
        this.logger.warn(
          `QueryHandler: Query validation failed: ${queryType}`,
          {
            queryId: (query as any).queryId,
            error: validationResult.error.message,
          },
        );

        return validationResult;
      }

      // Execute the actual query logic
      const result = await this.executeQuery(query);
      const executionTime = Date.now() - startTime;

      if (result.isSuccess) {
        this.logger.debug(
          `QueryHandler: Query completed successfully: ${queryType}`,
          {
            queryId: (query as any).queryId,
            executionTimeMs: executionTime,
          },
        );
      } else {
        this.logger.error(
          `QueryHandler: Query failed: ${queryType}`,
          result.error,
          {
            queryId: (query as any).queryId,
            executionTimeMs: executionTime,
          },
        );
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(`QueryHandler: Query exception: ${queryType}`, err, {
        queryId: (query as any).queryId,
        executionTimeMs: executionTime,
      });

      return Result.failure(err);
    }
  }

  /**
   * Get the query type this handler processes
   * Must be implemented by concrete handlers
   * @returns Query type identifier
   */
  public abstract getQueryType(): string;

  /**
   * Execute the actual query logic
   * Must be implemented by concrete handlers
   * @param query - Query to execute
   * @returns Promise resolving to Result with query result or error
   */
  protected abstract executeQuery(
    query: TQuery,
  ): Promise<Result<TResult, Error>>;

  /**
   * Validate the query before execution
   * Override in concrete handlers to add validation logic
   * @param query - Query to validate
   * @returns Promise resolving to Result indicating validation success or failure
   */
  protected async validateQuery(query: TQuery): Promise<Result<void, Error>> {
    // Default implementation - no validation
    return Result.success(undefined);
  }

  /**
   * Transform query result before returning
   * Override in concrete handlers to add transformation logic
   * @param result - Raw query result
   * @returns Transformed result
   */
  protected async transformResult(result: TResult): Promise<TResult> {
    // Default implementation - no transformation
    return result;
  }

  /**
   * Check if query is cacheable
   * Override in concrete handlers to implement caching logic
   * @param query - Query to check
   * @returns True if query result can be cached
   */
  protected isCacheable(query: TQuery): boolean {
    // Default implementation - not cacheable
    return false;
  }

  /**
   * Generate cache key for the query
   * Override in concrete handlers that support caching
   * @param query - Query to generate key for
   * @returns Cache key
   */
  protected getCacheKey(query: TQuery): string {
    // Default implementation - use query type
    return this.getQueryType();
  }
}

/**
 * Query handler registry for managing query handlers
 */
export class QueryHandlerRegistry {
  private readonly handlers = new Map<string, IQueryHandler<any, any>>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register a query handler
   * @param handler - Query handler to register
   */
  public register<TQuery extends IQuery<TResult>, TResult>(
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    const queryType = handler.getQueryType();

    if (this.handlers.has(queryType)) {
      throw new Error(
        `Query handler already registered for type: ${queryType}`,
      );
    }

    this.handlers.set(queryType, handler);

    this.logger.debug(
      `QueryHandlerRegistry: Registered handler for: ${queryType}`,
      {
        handlerCount: this.handlers.size,
      },
    );
  }

  /**
   * Get query handler for a specific type
   * @param queryType - Query type to get handler for
   * @returns Query handler or undefined if not found
   */
  public get<TQuery extends IQuery<TResult>, TResult>(
    queryType: string,
  ): IQueryHandler<TQuery, TResult> | undefined {
    return this.handlers.get(queryType);
  }

  /**
   * Check if handler is registered for query type
   * @param queryType - Query type to check
   * @returns True if handler is registered
   */
  public has(queryType: string): boolean {
    return this.handlers.has(queryType);
  }

  /**
   * Get all registered query types
   * @returns Array of query types
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get number of registered handlers
   * @returns Number of handlers
   */
  public getHandlerCount(): number {
    return this.handlers.size;
  }

  /**
   * Unregister a query handler
   * @param queryType - Query type to unregister
   * @returns True if handler was found and removed
   */
  public unregister(queryType: string): boolean {
    const removed = this.handlers.delete(queryType);

    if (removed) {
      this.logger.debug(
        `QueryHandlerRegistry: Unregistered handler for: ${queryType}`,
        {
          handlerCount: this.handlers.size,
        },
      );
    }

    return removed;
  }

  /**
   * Clear all registered handlers
   */
  public clear(): void {
    const count = this.handlers.size;
    this.handlers.clear();

    this.logger.debug(`QueryHandlerRegistry: Cleared all handlers`, {
      removedCount: count,
    });
  }
}

/**
 * Cached query handler that adds caching capabilities
 * Wraps another query handler to provide caching
 */
export class CachedQueryHandler<TQuery extends IQuery<TResult>, TResult>
  implements IQueryHandler<TQuery, TResult>
{
  private readonly cache = new Map<
    string,
    { result: TResult; timestamp: number }
  >();
  private readonly innerHandler: IQueryHandler<TQuery, TResult>;
  private readonly logger: Logger;
  private readonly cacheTimeoutMs: number;

  constructor(
    innerHandler: IQueryHandler<TQuery, TResult>,
    logger: Logger,
    cacheTimeoutMs: number = 300000, // 5 minutes default
  ) {
    this.innerHandler = innerHandler;
    this.logger = logger;
    this.cacheTimeoutMs = cacheTimeoutMs;
  }

  /**
   * Handle query with caching
   * @param query - Query to handle
   * @returns Promise resolving to Result with cached or fresh result
   */
  public async handle(query: TQuery): Promise<Result<TResult, Error>> {
    const cacheKey = this.generateCacheKey(query);
    const cachedEntry = this.cache.get(cacheKey);

    // Check if we have a valid cached result
    if (cachedEntry && this.isCacheValid(cachedEntry.timestamp)) {
      this.logger.debug(
        `CachedQueryHandler: Cache hit for: ${this.getQueryType()}`,
        {
          cacheKey,
          cacheAge: Date.now() - cachedEntry.timestamp,
        },
      );

      return Result.success(cachedEntry.result);
    }

    // Execute query and cache result
    const result = await this.innerHandler.handle(query);

    if (result.isSuccess) {
      this.cache.set(cacheKey, {
        result: result.value,
        timestamp: Date.now(),
      });

      this.logger.debug(
        `CachedQueryHandler: Cached result for: ${this.getQueryType()}`,
        {
          cacheKey,
          cacheSize: this.cache.size,
        },
      );
    }

    return result;
  }

  /**
   * Get query type from inner handler
   * @returns Query type
   */
  public getQueryType(): string {
    return this.innerHandler.getQueryType();
  }

  /**
   * Clear cache entries
   * @param olderThanMs - Optional: clear entries older than specified time
   */
  public clearCache(olderThanMs?: number): void {
    if (olderThanMs === undefined) {
      const count = this.cache.size;
      this.cache.clear();

      this.logger.debug(`CachedQueryHandler: Cleared all cache entries`, {
        clearedCount: count,
      });
    } else {
      const cutoff = Date.now() - olderThanMs;
      let clearedCount = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.timestamp < cutoff) {
          this.cache.delete(key);
          clearedCount++;
        }
      }

      this.logger.debug(`CachedQueryHandler: Cleared old cache entries`, {
        clearedCount,
        remainingCount: this.cache.size,
        cutoffTime: new Date(cutoff).toISOString(),
      });
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  public getCacheStats(): {
    entryCount: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    if (this.cache.size === 0) {
      return {
        entryCount: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const timestamps = Array.from(this.cache.values()).map(
      (entry) => entry.timestamp,
    );
    const oldest = Math.min(...timestamps);
    const newest = Math.max(...timestamps);

    return {
      entryCount: this.cache.size,
      oldestEntry: new Date(oldest),
      newestEntry: new Date(newest),
    };
  }

  /**
   * Generate cache key for query
   * @param query - Query to generate key for
   * @returns Cache key
   */
  private generateCacheKey(query: TQuery): string {
    // Simple implementation - can be overridden for more sophisticated key generation
    return `${this.getQueryType()}-${JSON.stringify(query)}`;
  }

  /**
   * Check if cached entry is still valid
   * @param timestamp - Entry timestamp
   * @returns True if cache entry is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeoutMs;
  }
}
