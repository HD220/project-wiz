import {
  IQuery,
  IQueryBus,
  IQueryHandler,
} from "../abstractions/query.interface";
import {
  ICommand,
  ICommandBus,
  ICommandHandler,
} from "../abstractions/command.interface";
import { Result } from "../abstractions/result.type";
import { Logger } from "../infrastructure/logger";
import { QueryHandlerRegistry } from "./query-handler";
import { CommandHandlerRegistry } from "./command-handler";

/**
 * CQRS Bus configuration options
 */
export interface CQRSBusOptions {
  /**
   * Maximum execution timeout (ms)
   */
  readonly timeout?: number;

  /**
   * Enable request/response logging
   */
  readonly enableLogging?: boolean;

  /**
   * Enable performance monitoring
   */
  readonly enablePerformanceMonitoring?: boolean;

  /**
   * Slow query/command threshold (ms)
   */
  readonly slowExecutionThresholdMs?: number;
}

/**
 * Query bus implementation for CQRS pattern
 * Handles query dispatching and execution
 */
export class QueryBus implements IQueryBus {
  private readonly handlerRegistry: QueryHandlerRegistry;
  private readonly logger: Logger;
  private readonly options: Required<CQRSBusOptions>;

  constructor(logger: Logger, options: CQRSBusOptions = {}) {
    this.handlerRegistry = new QueryHandlerRegistry(logger);
    this.logger = logger;
    this.options = {
      timeout: options.timeout ?? 30000,
      enableLogging: options.enableLogging ?? true,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      slowExecutionThresholdMs: options.slowExecutionThresholdMs ?? 1000,
    };
  }

  /**
   * Execute a query through the bus
   * @param query - Query to execute
   * @returns Promise resolving to Result with query result or error
   */
  public async execute<TResult>(
    query: IQuery<TResult>,
  ): Promise<Result<TResult, Error>> {
    const queryType = this.getQueryType(query);
    const startTime = performance.now();

    try {
      if (this.options.enableLogging) {
        this.logger.debug(`QueryBus: Executing query: ${queryType}`, {
          queryId: (query as any).queryId,
          queryType,
        });
      }

      // Get handler for query type
      const handler = this.handlerRegistry.get<IQuery<TResult>, TResult>(
        queryType,
      );
      if (!handler) {
        const error = new Error(
          `No handler registered for query type: ${queryType}`,
        );
        this.logger.error(`QueryBus: No handler found`, error, { queryType });
        return Result.failure(error);
      }

      // Execute with timeout
      const timeoutPromise = new Promise<Result<TResult, Error>>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Query execution timeout after ${this.options.timeout}ms`,
              ),
            ),
          this.options.timeout,
        ),
      );

      const executionPromise = handler.handle(query);
      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Performance monitoring
      if (this.options.enablePerformanceMonitoring) {
        const executionTime = performance.now() - startTime;

        if (executionTime > this.options.slowExecutionThresholdMs) {
          this.logger.warn(`QueryBus: Slow query detected: ${queryType}`, {
            queryId: (query as any).queryId,
            executionTimeMs: Math.round(executionTime),
            threshold: this.options.slowExecutionThresholdMs,
          });
        }

        if (this.options.enableLogging) {
          this.logger.debug(`QueryBus: Query executed: ${queryType}`, {
            queryId: (query as any).queryId,
            executionTimeMs: Math.round(executionTime),
            success: result.isSuccess,
          });
        }
      }

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(`QueryBus: Query execution failed: ${queryType}`, err, {
        queryId: (query as any).queryId,
        executionTimeMs: Math.round(executionTime),
      });

      return Result.failure(err);
    }
  }

  /**
   * Register a query handler
   * @param queryType - Query constructor/type
   * @param handler - Handler for the query
   */
  public register<TQuery extends IQuery<TResult>, TResult>(
    queryType: new (...args: unknown[]) => TQuery,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.handlerRegistry.register(handler);

    if (this.options.enableLogging) {
      this.logger.debug(
        `QueryBus: Registered handler for query type: ${queryType.name}`,
        {
          handlerType: handler.constructor.name,
          totalHandlers: this.handlerRegistry.getHandlerCount(),
        },
      );
    }
  }

  /**
   * Get registered query types
   * @returns Array of query types
   */
  public getRegisteredQueryTypes(): string[] {
    return this.handlerRegistry.getRegisteredTypes();
  }

  /**
   * Get number of registered handlers
   * @returns Number of handlers
   */
  public getHandlerCount(): number {
    return this.handlerRegistry.getHandlerCount();
  }

  /**
   * Extract query type from query instance
   * @param query - Query instance
   * @returns Query type string
   */
  private getQueryType(query: IQuery<unknown>): string {
    return query.constructor.name;
  }
}

/**
 * Command bus implementation for CQRS pattern
 * Handles command dispatching and execution
 */
export class CommandBus implements ICommandBus {
  private readonly handlerRegistry: CommandHandlerRegistry;
  private readonly logger: Logger;
  private readonly options: Required<CQRSBusOptions>;

  constructor(logger: Logger, options: CQRSBusOptions = {}) {
    this.handlerRegistry = new CommandHandlerRegistry(logger);
    this.logger = logger;
    this.options = {
      timeout: options.timeout ?? 30000,
      enableLogging: options.enableLogging ?? true,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      slowExecutionThresholdMs: options.slowExecutionThresholdMs ?? 1000,
    };
  }

  /**
   * Execute a command through the bus
   * @param command - Command to execute
   * @returns Promise resolving to Result with command result or error
   */
  public async execute<TResult>(
    command: ICommand<TResult>,
  ): Promise<Result<TResult, Error>> {
    const commandType = this.getCommandType(command);
    const startTime = performance.now();

    try {
      if (this.options.enableLogging) {
        this.logger.debug(`CommandBus: Executing command: ${commandType}`, {
          commandId: (command as any).commandId,
          commandType,
        });
      }

      // Get handler for command type
      const handler = this.handlerRegistry.get<ICommand<TResult>, TResult>(
        commandType,
      );
      if (!handler) {
        const error = new Error(
          `No handler registered for command type: ${commandType}`,
        );
        this.logger.error(`CommandBus: No handler found`, error, {
          commandType,
        });
        return Result.failure(error);
      }

      // Execute with timeout
      const timeoutPromise = new Promise<Result<TResult, Error>>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Command execution timeout after ${this.options.timeout}ms`,
              ),
            ),
          this.options.timeout,
        ),
      );

      const executionPromise = handler.handle(command);
      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Performance monitoring
      if (this.options.enablePerformanceMonitoring) {
        const executionTime = performance.now() - startTime;

        if (executionTime > this.options.slowExecutionThresholdMs) {
          this.logger.warn(
            `CommandBus: Slow command detected: ${commandType}`,
            {
              commandId: (command as any).commandId,
              executionTimeMs: Math.round(executionTime),
              threshold: this.options.slowExecutionThresholdMs,
            },
          );
        }

        if (this.options.enableLogging) {
          this.logger.debug(`CommandBus: Command executed: ${commandType}`, {
            commandId: (command as any).commandId,
            executionTimeMs: Math.round(executionTime),
            success: result.isSuccess,
          });
        }
      }

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `CommandBus: Command execution failed: ${commandType}`,
        err,
        {
          commandId: (command as any).commandId,
          executionTimeMs: Math.round(executionTime),
        },
      );

      return Result.failure(err);
    }
  }

  /**
   * Register a command handler
   * @param commandType - Command constructor/type
   * @param handler - Handler for the command
   */
  public register<TCommand extends ICommand<TResult>, TResult>(
    commandType: new (...args: unknown[]) => TCommand,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    this.handlerRegistry.register(handler);

    if (this.options.enableLogging) {
      this.logger.debug(
        `CommandBus: Registered handler for command type: ${commandType.name}`,
        {
          handlerType: handler.constructor.name,
          totalHandlers: this.handlerRegistry.getHandlerCount(),
        },
      );
    }
  }

  /**
   * Get registered command types
   * @returns Array of command types
   */
  public getRegisteredCommandTypes(): string[] {
    return this.handlerRegistry.getRegisteredTypes();
  }

  /**
   * Get number of registered handlers
   * @returns Number of handlers
   */
  public getHandlerCount(): number {
    return this.handlerRegistry.getHandlerCount();
  }

  /**
   * Extract command type from command instance
   * @param command - Command instance
   * @returns Command type string
   */
  private getCommandType(command: ICommand<unknown>): string {
    return command.constructor.name;
  }
}

/**
 * Combined CQRS Bus that provides both query and command functionality
 */
export class CQRSBus {
  private readonly queryBus: QueryBus;
  private readonly commandBus: CommandBus;
  private readonly logger: Logger;

  constructor(logger: Logger, options: CQRSBusOptions = {}) {
    this.logger = logger;
    this.queryBus = new QueryBus(logger, options);
    this.commandBus = new CommandBus(logger, options);

    this.logger.debug("CQRSBus: Initialized", {
      enableLogging: options.enableLogging ?? true,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      timeout: options.timeout ?? 30000,
    });
  }

  /**
   * Execute a query
   * @param query - Query to execute
   * @returns Promise resolving to Result with query result or error
   */
  public async query<TResult>(
    query: IQuery<TResult>,
  ): Promise<Result<TResult, Error>> {
    return await this.queryBus.execute(query);
  }

  /**
   * Execute a command
   * @param command - Command to execute
   * @returns Promise resolving to Result with command result or error
   */
  public async command<TResult>(
    command: ICommand<TResult>,
  ): Promise<Result<TResult, Error>> {
    return await this.commandBus.execute(command);
  }

  /**
   * Register a query handler
   * @param queryType - Query constructor/type
   * @param handler - Handler for the query
   */
  public registerQueryHandler<TQuery extends IQuery<TResult>, TResult>(
    queryType: new (...args: unknown[]) => TQuery,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    this.queryBus.register(queryType, handler);
  }

  /**
   * Register a command handler
   * @param commandType - Command constructor/type
   * @param handler - Handler for the command
   */
  public registerCommandHandler<TCommand extends ICommand<TResult>, TResult>(
    commandType: new (...args: unknown[]) => TCommand,
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    this.commandBus.register(commandType, handler);
  }

  /**
   * Get statistics about registered handlers
   * @returns Handler statistics
   */
  public getStats(): {
    queryHandlers: number;
    commandHandlers: number;
    registeredQueryTypes: string[];
    registeredCommandTypes: string[];
  } {
    return {
      queryHandlers: this.queryBus.getHandlerCount(),
      commandHandlers: this.commandBus.getHandlerCount(),
      registeredQueryTypes: this.queryBus.getRegisteredQueryTypes(),
      registeredCommandTypes: this.commandBus.getRegisteredCommandTypes(),
    };
  }

  /**
   * Get query bus instance
   * @returns Query bus
   */
  public getQueryBus(): QueryBus {
    return this.queryBus;
  }

  /**
   * Get command bus instance
   * @returns Command bus
   */
  public getCommandBus(): CommandBus {
    return this.commandBus;
  }
}
