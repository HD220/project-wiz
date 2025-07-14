/**
 * @fileoverview Exportações centralizadas do sistema de infrastructure
 *
 * Este arquivo centraliza todas as exportações do sistema de infrastructure,
 * incluindo logging, transports e utilitários relacionados.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

// Logging Core
export { Logger, LoggerConfig } from "./logger";
export { LoggerFactory, LoggerFactoryConfig } from "./logger-factory";

// Log Levels
export {
  LogLevel,
  LOG_LEVEL_NAMES,
  LOG_LEVEL_VALUES,
  LogLevelString,
} from "./log-level.enum";

// Log Entry
export {
  LogEntry,
  LogContext,
  LogError,
  LogEntryConfig,
  SerializedLogEntry,
} from "./log-entry.interface";

// Transports
export {
  LogTransport,
  LogTransportConfig,
  ConsoleTransportConfig,
  FileTransportConfig,
  NetworkTransportConfig,
  TransportStats,
  StatefulLogTransport,
} from "./log-transport.interface";

// Transport Implementations
export { ConsoleTransport } from "./console-transport";
export { FileTransport } from "./file-transport";

// Tipos utilitários
export type {
  LoggerConfig as ILoggerConfig,
  LoggerFactoryConfig as ILoggerFactoryConfig,
};

/**
 * Utilitário para criar logger padrão de desenvolvimento
 */
export function createDevelopmentLogger(module: string) {
  const factory = new LoggerFactory(LoggerFactory.createDevelopmentConfig());
  return factory.createLogger(module);
}

/**
 * Utilitário para criar logger padrão de produção
 */
export function createProductionLogger(
  module: string,
  logPath?: string,
) {
  const factory = new LoggerFactory(
    LoggerFactory.createProductionConfig(logPath),
  );
  return factory.createLogger(module);
}

/**
 * Utilitário para criar logger baseado no ambiente
 */
export function createEnvironmentLogger(module: string, env?: string) {
  const environment = env || process.env.NODE_ENV || "development";

  if (environment === "production") {
    return createProductionLogger(module);
  }

  return createDevelopmentLogger(module);
}
