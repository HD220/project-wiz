/**
 * Enum de níveis de log compatível com Pino.js
 *
 * Os valores numéricos seguem a convenção do Pino:
 * - Valores menores = maior prioridade
 * - Trace (10) é o mais detalhado
 * - Fatal (60) é o mais crítico
 *
 * @example
 * ```typescript
 * const logger = new Logger({ level: LogLevel.INFO });
 * logger.debug('Mensagem de debug'); // Será ignorada
 * logger.info('Mensagem info'); // Será exibida
 * ```
 */
export enum LogLevel {
  /** Informações de rastreamento detalhadas (nível 10) */
  TRACE = 10,

  /** Informações de debugging (nível 20) */
  DEBUG = 20,

  /** Informações gerais do sistema (nível 30) */
  INFO = 30,

  /** Avisos importantes que requerem atenção (nível 40) */
  WARN = 40,

  /** Erros que requerem atenção imediata (nível 50) */
  ERROR = 50,

  /** Erros fatais que podem causar encerramento (nível 60) */
  FATAL = 60,

  /** Silencia todos os logs */
  SILENT = Infinity,
}

/**
 * Mapa de níveis de log para strings (compatível com Pino)
 */
export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.TRACE]: "trace",
  [LogLevel.DEBUG]: "debug",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error",
  [LogLevel.FATAL]: "fatal",
  [LogLevel.SILENT]: "silent",
};

/**
 * Mapa de strings para níveis de log
 */
export const LOG_LEVEL_VALUES: Record<string, LogLevel> = {
  trace: LogLevel.TRACE,
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  fatal: LogLevel.FATAL,
  silent: LogLevel.SILENT,
};

/**
 * Tipo para strings de nível de log válidas
 */
export type LogLevelString = keyof typeof LOG_LEVEL_VALUES;
