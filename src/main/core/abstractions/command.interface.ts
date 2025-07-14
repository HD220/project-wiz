import { Result } from "./result.type";

/**
 * Base command interface for CQRS pattern
 * Defines contract for write operations
 *
 * @template TResult - Type of command result
 */
export interface ICommand<TResult> {
  /**
   * Execute the command
   * @returns Promise resolving to Result with command result or error
   */
  execute(): Promise<Result<TResult, Error>>;
}

/**
 * Parameterized command interface for commands with parameters
 * Defines contract for write operations with input parameters
 *
 * @template TParams - Type of command parameters
 * @template TResult - Type of command result
 */
export interface IParameterizedCommand<TParams, TResult> {
  /**
   * Execute the command with parameters
   * @param params - Command parameters
   * @returns Promise resolving to Result with command result or error
   */
  execute(params: TParams): Promise<Result<TResult, Error>>;
}

/**
 * Command handler interface for processing commands
 * Defines contract for command handlers in CQRS pattern
 *
 * @template TCommand - Type of command to handle
 * @template TResult - Type of command result
 */
export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult> {
  /**
   * Handle the command execution
   * @param command - Command to handle
   * @returns Promise resolving to Result with command result or error
   */
  handle(command: TCommand): Promise<Result<TResult, Error>>;
}

/**
 * Command bus interface for dispatching commands
 * Defines contract for command dispatching in CQRS pattern
 */
export interface ICommandBus {
  /**
   * Execute a command through the bus
   * @param command - Command to execute
   * @returns Promise resolving to Result with command result or error
   */
  execute<TResult>(command: ICommand<TResult>): Promise<Result<TResult, Error>>;

  /**
   * Register a command handler
   * @param commandType - Command constructor/type
   * @param handler - Handler for the command
   */
  register<TCommand extends ICommand<TResult>, TResult>(
    commandType: new (...args: unknown[]) => TCommand,
    handler: ICommandHandler<TCommand, TResult>,
  ): void;
}
