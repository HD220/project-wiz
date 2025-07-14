/**
 * @fileoverview Exportações centralizadas do sistema de aplicação (CQRS)
 *
 * Este arquivo centraliza todas as exportações do sistema de aplicação,
 * incluindo CQRS (Command Query Responsibility Segregation), handlers,
 * buses e utilitários relacionados.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

// =============================================================================
// CQRS QUERY HANDLERS
// =============================================================================

// Query Handler Base Classes
export {
  BaseQueryHandler,
  QueryHandlerRegistry,
  CachedQueryHandler,
} from "./query-handler";

// =============================================================================
// CQRS COMMAND HANDLERS
// =============================================================================

// Command Handler Base Classes
export {
  BaseCommandHandler,
  CommandHandlerRegistry,
  IdempotentCommandHandler,
} from "./command-handler";

// =============================================================================
// CQRS BUSES
// =============================================================================

// CQRS Bus Implementation
export { QueryBus, CommandBus, CQRSBus, CQRSBusOptions } from "./cqrs-bus";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility to create a complete CQRS system with buses and handlers
 * @param logger - Logger instance
 * @param options - CQRS bus options
 * @returns Complete CQRS system
 */
export function createCQRSSystem(
  logger: import("../infrastructure/logger").Logger,
  options?: import("./cqrs-bus").CQRSBusOptions,
) {
  const cqrsBus = new CQRSBus(logger, options);

  logger.debug("CQRS System: Initialized", {
    enableLogging: options?.enableLogging ?? true,
    enablePerformanceMonitoring: options?.enablePerformanceMonitoring ?? true,
    timeout: options?.timeout ?? 30000,
  });

  return {
    cqrsBus,
    queryBus: cqrsBus.getQueryBus(),
    commandBus: cqrsBus.getCommandBus(),

    // Convenience methods
    query: <TResult>(
      query: import("../abstractions/query.interface").IQuery<TResult>,
    ) => cqrsBus.query(query),

    command: <TResult>(
      command: import("../abstractions/command.interface").ICommand<TResult>,
    ) => cqrsBus.command(command),

    registerQueryHandler: <
      TQuery extends import("../abstractions/query.interface").IQuery<TResult>,
      TResult,
    >(
      queryType: new (...args: unknown[]) => TQuery,
      handler: import("../abstractions/query.interface").IQueryHandler<
        TQuery,
        TResult
      >,
    ) => cqrsBus.registerQueryHandler(queryType, handler),

    registerCommandHandler: <
      TCommand extends
        import("../abstractions/command.interface").ICommand<TResult>,
      TResult,
    >(
      commandType: new (...args: unknown[]) => TCommand,
      handler: import("../abstractions/command.interface").ICommandHandler<
        TCommand,
        TResult
      >,
    ) => cqrsBus.registerCommandHandler(commandType, handler),

    getStats: () => cqrsBus.getStats(),
  };
}

/**
 * Utility to create a cached query handler
 * @param innerHandler - The actual query handler to wrap
 * @param logger - Logger instance
 * @param cacheTimeoutMs - Cache timeout in milliseconds (default: 5 minutes)
 * @returns Cached query handler
 */
export function createCachedQueryHandler<
  TQuery extends import("../abstractions/query.interface").IQuery<TResult>,
  TResult,
>(
  innerHandler: import("../abstractions/query.interface").IQueryHandler<
    TQuery,
    TResult
  >,
  logger: import("../infrastructure/logger").Logger,
  cacheTimeoutMs: number = 300000,
) {
  return new CachedQueryHandler(innerHandler, logger, cacheTimeoutMs);
}

/**
 * Utility to create an idempotent command handler
 * @param innerHandler - The actual command handler to wrap
 * @param logger - Logger instance
 * @param resultTimeoutMs - Result cache timeout in milliseconds (default: 1 hour)
 * @returns Idempotent command handler
 */
export function createIdempotentCommandHandler<
  TCommand extends
    import("../abstractions/command.interface").ICommand<TResult>,
  TResult,
>(
  innerHandler: import("../abstractions/command.interface").ICommandHandler<
    TCommand,
    TResult
  >,
  logger: import("../infrastructure/logger").Logger,
  resultTimeoutMs: number = 3600000,
) {
  return new IdempotentCommandHandler(innerHandler, logger, resultTimeoutMs);
}

/**
 * Utility to create query and command registries
 * @param logger - Logger instance
 * @returns Object with query and command registries
 */
export function createHandlerRegistries(
  logger: import("../infrastructure/logger").Logger,
) {
  const queryRegistry = new QueryHandlerRegistry(logger);
  const commandRegistry = new CommandHandlerRegistry(logger);

  return {
    queryRegistry,
    commandRegistry,

    // Convenience methods
    registerQuery: <
      TQuery extends import("../abstractions/query.interface").IQuery<TResult>,
      TResult,
    >(
      handler: import("../abstractions/query.interface").IQueryHandler<
        TQuery,
        TResult
      >,
    ) => queryRegistry.register(handler),

    registerCommand: <
      TCommand extends
        import("../abstractions/command.interface").ICommand<TResult>,
      TResult,
    >(
      handler: import("../abstractions/command.interface").ICommandHandler<
        TCommand,
        TResult
      >,
    ) => commandRegistry.register(handler),

    getQueryHandler: <
      TQuery extends import("../abstractions/query.interface").IQuery<TResult>,
      TResult,
    >(
      queryType: string,
    ) => queryRegistry.get<TQuery, TResult>(queryType),

    getCommandHandler: <
      TCommand extends
        import("../abstractions/command.interface").ICommand<TResult>,
      TResult,
    >(
      commandType: string,
    ) => commandRegistry.get<TCommand, TResult>(commandType),

    getStats: () => ({
      queryHandlers: queryRegistry.getHandlerCount(),
      commandHandlers: commandRegistry.getHandlerCount(),
      registeredQueryTypes: queryRegistry.getRegisteredTypes(),
      registeredCommandTypes: commandRegistry.getRegisteredTypes(),
    }),
  };
}

/**
 * Create a complete CQRS application layer with all components
 * @param logger - Logger instance
 * @param options - CQRS bus options
 * @returns Complete CQRS application layer
 */
export function createCQRSApplicationLayer(
  logger: import("../infrastructure/logger").Logger,
  options?: import("./cqrs-bus").CQRSBusOptions,
) {
  const cqrsSystem = createCQRSSystem(logger, options);
  const registries = createHandlerRegistries(logger);

  logger.info("CQRS Application Layer: Initialized", {
    busOptions: options,
  });

  return {
    ...cqrsSystem,
    ...registries,

    // Factory methods
    createCachedQueryHandler: <
      TQuery extends import("../abstractions/query.interface").IQuery<TResult>,
      TResult,
    >(
      innerHandler: import("../abstractions/query.interface").IQueryHandler<
        TQuery,
        TResult
      >,
      cacheTimeoutMs?: number,
    ) => createCachedQueryHandler(innerHandler, logger, cacheTimeoutMs),

    createIdempotentCommandHandler: <
      TCommand extends
        import("../abstractions/command.interface").ICommand<TResult>,
      TResult,
    >(
      innerHandler: import("../abstractions/command.interface").ICommandHandler<
        TCommand,
        TResult
      >,
      resultTimeoutMs?: number,
    ) => createIdempotentCommandHandler(innerHandler, logger, resultTimeoutMs),
  };
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export important types for convenience
export type {
  IQuery,
  IParameterizedQuery,
  IQueryHandler,
  IQueryBus,
} from "../abstractions/query.interface";

export type {
  ICommand,
  IParameterizedCommand,
  ICommandHandler,
  ICommandBus,
} from "../abstractions/command.interface";

export type { Result } from "../abstractions/result.type";
