import { ICommand, ICommandHandler } from "../abstractions/command.interface";
import { Result } from "../abstractions/result.type";
import { Logger } from "../infrastructure/logger";
import { IDomainEvent } from "../abstractions/domain-event.type";

/**
 * Abstract base class for command handlers
 * Provides common functionality for CQRS command processing
 *
 * @template TCommand - Type of command to handle
 * @template TResult - Type of command result
 */
export abstract class BaseCommandHandler<
  TCommand extends ICommand<TResult>,
  TResult,
> implements ICommandHandler<TCommand, TResult>
{
  protected readonly logger: Logger;
  protected readonly domainEvents: IDomainEvent[] = [];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Handle the command execution
   * Template method that includes logging, validation, and error handling
   * @param command - Command to handle
   * @returns Promise resolving to Result with command result or error
   */
  public async handle(command: TCommand): Promise<Result<TResult, Error>> {
    const commandType = this.getCommandType();
    const startTime = Date.now();

    try {
      this.logger.debug(`CommandHandler: Processing command: ${commandType}`, {
        commandId: (command as any).commandId,
        startTime: new Date(startTime).toISOString(),
      });

      // Clear any previous domain events
      this.domainEvents.length = 0;

      // Validate command if validation is implemented
      const validationResult = await this.validateCommand(command);
      if (validationResult.isFailure) {
        this.logger.warn(
          `CommandHandler: Command validation failed: ${commandType}`,
          {
            commandId: (command as any).commandId,
            error: validationResult.error.message,
          },
        );

        return validationResult;
      }

      // Execute the actual command logic
      const result = await this.executeCommand(command);
      const executionTime = Date.now() - startTime;

      if (result.isSuccess) {
        // Publish domain events if command succeeded
        if (this.domainEvents.length > 0) {
          await this.publishDomainEvents();
        }

        this.logger.debug(
          `CommandHandler: Command completed successfully: ${commandType}`,
          {
            commandId: (command as any).commandId,
            executionTimeMs: executionTime,
            domainEventsCount: this.domainEvents.length,
          },
        );
      } else {
        this.logger.error(
          `CommandHandler: Command failed: ${commandType}`,
          result.error,
          {
            commandId: (command as any).commandId,
            executionTimeMs: executionTime,
          },
        );
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `CommandHandler: Command exception: ${commandType}`,
        err,
        {
          commandId: (command as any).commandId,
          executionTimeMs: executionTime,
        },
      );

      return Result.failure(err);
    }
  }

  /**
   * Get the command type this handler processes
   * Must be implemented by concrete handlers
   * @returns Command type identifier
   */
  public abstract getCommandType(): string;

  /**
   * Execute the actual command logic
   * Must be implemented by concrete handlers
   * @param command - Command to execute
   * @returns Promise resolving to Result with command result or error
   */
  protected abstract executeCommand(
    command: TCommand,
  ): Promise<Result<TResult, Error>>;

  /**
   * Validate the command before execution
   * Override in concrete handlers to add validation logic
   * @param command - Command to validate
   * @returns Promise resolving to Result indicating validation success or failure
   */
  protected async validateCommand(
    command: TCommand,
  ): Promise<Result<void, Error>> {
    // Default implementation - no validation
    return Result.success(undefined);
  }

  /**
   * Add a domain event to be published after successful command execution
   * @param event - Domain event to add
   */
  protected addDomainEvent(event: IDomainEvent): void {
    this.domainEvents.push(event);

    this.logger.debug(
      `CommandHandler: Added domain event: ${event.eventName}`,
      {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        totalEvents: this.domainEvents.length,
      },
    );
  }

  /**
   * Get all domain events that will be published
   * @returns Array of domain events
   */
  protected getDomainEvents(): readonly IDomainEvent[] {
    return [...this.domainEvents];
  }

  /**
   * Clear all domain events
   */
  protected clearDomainEvents(): void {
    const count = this.domainEvents.length;
    this.domainEvents.length = 0;

    this.logger.debug(`CommandHandler: Cleared domain events`, {
      clearedCount: count,
    });
  }

  /**
   * Publish domain events
   * Override in concrete handlers to implement event publishing
   * @returns Promise that resolves when events are published
   */
  protected async publishDomainEvents(): Promise<void> {
    // Default implementation - log events
    for (const event of this.domainEvents) {
      this.logger.debug(
        `CommandHandler: Would publish domain event: ${event.eventName}`,
        {
          eventId: event.eventId,
          aggregateId: event.aggregateId,
          eventData: event.data,
        },
      );
    }

    // Clear events after publishing
    this.clearDomainEvents();
  }

  /**
   * Check if command execution should be idempotent
   * Override in concrete handlers to implement idempotency
   * @param command - Command to check
   * @returns True if command should be idempotent
   */
  protected isIdempotent(command: TCommand): boolean {
    // Default implementation - not idempotent
    return false;
  }

  /**
   * Generate idempotency key for the command
   * Override in concrete handlers that support idempotency
   * @param command - Command to generate key for
   * @returns Idempotency key
   */
  protected getIdempotencyKey(command: TCommand): string {
    // Default implementation - use command type and data
    return `${this.getCommandType()}-${JSON.stringify(command)}`;
  }
}

/**
 * Command handler registry for managing command handlers
 */
export class CommandHandlerRegistry {
  private readonly handlers = new Map<string, ICommandHandler<any, any>>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register a command handler
   * @param handler - Command handler to register
   */
  public register<TCommand extends ICommand<TResult>, TResult>(
    handler: ICommandHandler<TCommand, TResult>,
  ): void {
    const commandType = handler.getCommandType();

    if (this.handlers.has(commandType)) {
      throw new Error(
        `Command handler already registered for type: ${commandType}`,
      );
    }

    this.handlers.set(commandType, handler);

    this.logger.debug(
      `CommandHandlerRegistry: Registered handler for: ${commandType}`,
      {
        handlerCount: this.handlers.size,
      },
    );
  }

  /**
   * Get command handler for a specific type
   * @param commandType - Command type to get handler for
   * @returns Command handler or undefined if not found
   */
  public get<TCommand extends ICommand<TResult>, TResult>(
    commandType: string,
  ): ICommandHandler<TCommand, TResult> | undefined {
    return this.handlers.get(commandType);
  }

  /**
   * Check if handler is registered for command type
   * @param commandType - Command type to check
   * @returns True if handler is registered
   */
  public has(commandType: string): boolean {
    return this.handlers.has(commandType);
  }

  /**
   * Get all registered command types
   * @returns Array of command types
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
   * Unregister a command handler
   * @param commandType - Command type to unregister
   * @returns True if handler was found and removed
   */
  public unregister(commandType: string): boolean {
    const removed = this.handlers.delete(commandType);

    if (removed) {
      this.logger.debug(
        `CommandHandlerRegistry: Unregistered handler for: ${commandType}`,
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

    this.logger.debug(`CommandHandlerRegistry: Cleared all handlers`, {
      removedCount: count,
    });
  }
}

/**
 * Idempotent command handler wrapper
 * Adds idempotency support to command handlers
 */
export class IdempotentCommandHandler<
  TCommand extends ICommand<TResult>,
  TResult,
> implements ICommandHandler<TCommand, TResult>
{
  private readonly executionResults = new Map<
    string,
    {
      result: Result<TResult, Error>;
      timestamp: number;
    }
  >();
  private readonly innerHandler: ICommandHandler<TCommand, TResult>;
  private readonly logger: Logger;
  private readonly resultTimeoutMs: number;

  constructor(
    innerHandler: ICommandHandler<TCommand, TResult>,
    logger: Logger,
    resultTimeoutMs: number = 3600000, // 1 hour default
  ) {
    this.innerHandler = innerHandler;
    this.logger = logger;
    this.resultTimeoutMs = resultTimeoutMs;
  }

  /**
   * Handle command with idempotency support
   * @param command - Command to handle
   * @returns Promise resolving to Result with cached or fresh result
   */
  public async handle(command: TCommand): Promise<Result<TResult, Error>> {
    const idempotencyKey = this.generateIdempotencyKey(command);
    const existingResult = this.executionResults.get(idempotencyKey);

    // Check if we have a valid cached result
    if (existingResult && this.isResultValid(existingResult.timestamp)) {
      this.logger.debug(
        `IdempotentCommandHandler: Returning cached result for: ${this.getCommandType()}`,
        {
          idempotencyKey,
          resultAge: Date.now() - existingResult.timestamp,
        },
      );

      return existingResult.result;
    }

    // Execute command and cache result
    const result = await this.innerHandler.handle(command);

    // Cache the result (both success and failure)
    this.executionResults.set(idempotencyKey, {
      result,
      timestamp: Date.now(),
    });

    this.logger.debug(
      `IdempotentCommandHandler: Cached execution result for: ${this.getCommandType()}`,
      {
        idempotencyKey,
        success: result.isSuccess,
        cacheSize: this.executionResults.size,
      },
    );

    return result;
  }

  /**
   * Get command type from inner handler
   * @returns Command type
   */
  public getCommandType(): string {
    return this.innerHandler.getCommandType();
  }

  /**
   * Clear cached results
   * @param olderThanMs - Optional: clear results older than specified time
   */
  public clearResults(olderThanMs?: number): void {
    if (olderThanMs === undefined) {
      const count = this.executionResults.size;
      this.executionResults.clear();

      this.logger.debug(
        `IdempotentCommandHandler: Cleared all cached results`,
        {
          clearedCount: count,
        },
      );
    } else {
      const cutoff = Date.now() - olderThanMs;
      let clearedCount = 0;

      for (const [key, entry] of this.executionResults.entries()) {
        if (entry.timestamp < cutoff) {
          this.executionResults.delete(key);
          clearedCount++;
        }
      }

      this.logger.debug(
        `IdempotentCommandHandler: Cleared old cached results`,
        {
          clearedCount,
          remainingCount: this.executionResults.size,
          cutoffTime: new Date(cutoff).toISOString(),
        },
      );
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  public getCacheStats(): {
    entryCount: number;
    successCount: number;
    failureCount: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    if (this.executionResults.size === 0) {
      return {
        entryCount: 0,
        successCount: 0,
        failureCount: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const entries = Array.from(this.executionResults.values());
    const timestamps = entries.map((entry) => entry.timestamp);
    const oldest = Math.min(...timestamps);
    const newest = Math.max(...timestamps);

    const successCount = entries.filter(
      (entry) => entry.result.isSuccess,
    ).length;
    const failureCount = entries.length - successCount;

    return {
      entryCount: this.executionResults.size,
      successCount,
      failureCount,
      oldestEntry: new Date(oldest),
      newestEntry: new Date(newest),
    };
  }

  /**
   * Generate idempotency key for command
   * @param command - Command to generate key for
   * @returns Idempotency key
   */
  private generateIdempotencyKey(command: TCommand): string {
    // Simple implementation - can be overridden for more sophisticated key generation
    return `${this.getCommandType()}-${JSON.stringify(command)}`;
  }

  /**
   * Check if cached result is still valid
   * @param timestamp - Result timestamp
   * @returns True if cached result is valid
   */
  private isResultValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.resultTimeoutMs;
  }
}
