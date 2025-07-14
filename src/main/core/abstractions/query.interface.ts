import { Result } from "./result.type";

/**
 * Base query interface for CQRS pattern
 * Defines contract for read operations
 *
 * @template TResult - Type of query result
 */
export interface IQuery<TResult> {
  /**
   * Execute the query
   * @returns Promise resolving to Result with query result or error
   */
  execute(): Promise<Result<TResult, Error>>;
}

/**
 * Parameterized query interface for queries with parameters
 * Defines contract for read operations with input parameters
 *
 * @template TParams - Type of query parameters
 * @template TResult - Type of query result
 */
export interface IParameterizedQuery<TParams, TResult> {
  /**
   * Execute the query with parameters
   * @param params - Query parameters
   * @returns Promise resolving to Result with query result or error
   */
  execute(params: TParams): Promise<Result<TResult, Error>>;
}

/**
 * Query handler interface for processing queries
 * Defines contract for query handlers in CQRS pattern
 *
 * @template TQuery - Type of query to handle
 * @template TResult - Type of query result
 */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  /**
   * Handle the query execution
   * @param query - Query to handle
   * @returns Promise resolving to Result with query result or error
   */
  handle(query: TQuery): Promise<Result<TResult, Error>>;
}

/**
 * Query bus interface for dispatching queries
 * Defines contract for query dispatching in CQRS pattern
 */
export interface IQueryBus {
  /**
   * Execute a query through the bus
   * @param query - Query to execute
   * @returns Promise resolving to Result with query result or error
   */
  execute<TResult>(query: IQuery<TResult>): Promise<Result<TResult, Error>>;

  /**
   * Register a query handler
   * @param queryType - Query constructor/type
   * @param handler - Handler for the query
   */
  register<TQuery extends IQuery<TResult>, TResult>(
    queryType: new (...args: unknown[]) => TQuery,
    handler: IQueryHandler<TQuery, TResult>,
  ): void;
}
