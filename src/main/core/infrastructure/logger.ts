import pino, { Logger as PinoLogger, LoggerOptions } from "pino";
import { LogLevel, LOG_LEVEL_NAMES } from "./log-level.enum";
import { LogEntry, LogContext, LogError } from "./log-entry.interface";
import { LogTransport } from "./log-transport.interface";
import { DomainError } from "../errors";

/**
 * Configuração do Logger baseado em Pino.js
 */
export interface LoggerConfig {
  /** Nível mínimo de log */
  level: LogLevel;

  /** Nome do logger */
  name?: string;

  /** Contexto padrão */
  context?: LogContext;

  /** Transports personalizados */
  transports?: LogTransport[];

  /** Configurações do Pino */
  pinoOptions?: LoggerOptions;

  /** Habilitar pretty print (desenvolvimento) */
  pretty?: boolean;

  /** Habilitar redact para campos sensíveis */
  redact?: string[];

  /** Configuração de serializers */
  serializers?: Record<string, (value: unknown) => unknown>;
}

/**
 * Classe principal de logging usando Pino.js
 *
 * Implementa um sistema de logging robusto e performático
 * baseado no Pino.js com suporte a transports customizados.
 *
 * @example
 * ```typescript
 * const logger = new Logger({
 *   level: LogLevel.INFO,
 *   name: 'my-service',
 *   context: { module: 'user-service' }
 * });
 *
 * logger.info('Usuário criado', { userId: 'user-123' });
 * logger.error('Erro ao criar usuário', error);
 * ```
 */
export class Logger {
  private readonly pinoLogger: PinoLogger;
  private readonly config: LoggerConfig;
  private readonly transports: LogTransport[] = [];
  private correlationId?: string;
  private requestId?: string;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.pinoLogger = this.createPinoLogger();

    if (config.transports) {
      this.transports.push(...config.transports);
    }
  }

  /**
   * Cria a instância do Pino Logger
   */
  private createPinoLogger(): PinoLogger {
    const options: LoggerOptions = {
      name: this.config.name,
      level: LOG_LEVEL_NAMES[this.config.level],

      // Configurações de timestamp
      timestamp: pino.stdTimeFunctions.isoTime,

      // Configurações de formatação
      formatters: {
        level: (label: string, number: number) => ({ level: number }),
        log: (object: Record<string, unknown>) => {
          // Adiciona contexto padrão
          if (this.config.context) {
            object.context = { ...this.config.context, ...(object.context as LogContext) };
          }

          // Adiciona IDs de correlação
          if (this.correlationId) {
            object.correlationId = this.correlationId;
          }

          if (this.requestId) {
            object.requestId = this.requestId;
          }

          return object;
        },
      },

      // Configurações de serialização
      serializers: {
        error: this.serializeError.bind(this),
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
        ...this.config.serializers,
      },

      // Configurações de redact
      redact: this.config.redact || [
        "password",
        "apiKey",
        "token",
        "secret",
        "authorization",
        "cookie",
        "session",
      ],

      ...this.config.pinoOptions,
    };

    // Configuração de transports
    const streams: pino.StreamEntry[] = [];

    if (this.config.pretty) {
      // Stream para console com pino-pretty
      streams.push({
        level: LOG_LEVEL_NAMES[this.config.level] as pino.Level,
        stream: pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }),
      });
    } else {
      // Stream padrão para console
      streams.push({
        level: LOG_LEVEL_NAMES[this.config.level] as pino.Level,
        stream: process.stdout,
      });
    }

    return streams.length > 0
      ? pino(options, pino.multistream(streams))
      : pino(options);
  }

  /**
   * Serializa erros para log
   */
  private serializeError(error: unknown): LogError {
    if (error instanceof DomainError) {
      return {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack,
        details: error.details,
        cause: error.cause,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause,
      };
    }

    return {
      message: String(error),
      name: "Unknown",
      details: { originalError: error },
    };
  }

  /**
   * Processa uma entrada de log através dos transports
   */
  private async processTransports(entry: LogEntry): Promise<void> {
    const promises = this.transports
      .filter((transport) => transport.accepts(entry.level))
      .map((transport) => transport.write(entry));

    await Promise.allSettled(promises);
  }

  /**
   * Cria uma entrada de log base
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
    error?: unknown,
  ): LogEntry {
    return {
      time: Date.now(),
      level,
      pid: process.pid,
      hostname: require("os").hostname() as string,
      msg: message,
      context: { ...this.config.context, ...context },
      metadata,
      error: error ? this.serializeError(error) : undefined,
      correlationId: this.correlationId,
      requestId: this.requestId,
    };
  }

  /**
   * Log de nível TRACE
   */
  trace(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry(
      LogLevel.TRACE,
      message,
      context,
      metadata,
    );
    this.pinoLogger.trace(entry);
    this.processTransports(entry).catch(console.error);
  }

  /**
   * Log de nível DEBUG
   */
  debug(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      message,
      context,
      metadata,
    );
    this.pinoLogger.debug(entry);
    this.processTransports(entry).catch(console.error);
  }

  /**
   * Log de nível INFO
   */
  info(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      message,
      context,
      metadata,
    );
    this.pinoLogger.info(entry);
    this.processTransports(entry).catch(console.error);
  }

  /**
   * Log de nível WARN
   */
  warn(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry(
      LogLevel.WARN,
      message,
      context,
      metadata,
    );
    this.pinoLogger.warn(entry);
    this.processTransports(entry).catch(console.error);
  }

  /**
   * Log de nível ERROR
   */
  error(
    message: string,
    error?: unknown,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      context,
      metadata,
      error,
    );
    this.pinoLogger.error(entry);
    this.processTransports(entry).catch(console.error);
  }

  /**
   * Log de nível FATAL
   */
  fatal(
    message: string,
    error?: unknown,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry(
      LogLevel.FATAL,
      message,
      context,
      metadata,
      error,
    );
    this.pinoLogger.fatal(entry);
    this.processTransports(entry).catch(console.error);
  }

  /**
   * Define o ID de correlação para rastreamento
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Define o ID da requisição para rastreamento
   */
  setRequestId(id: string): void {
    this.requestId = id;
  }

  /**
   * Remove IDs de rastreamento
   */
  clearTrackingIds(): void {
    this.correlationId = undefined;
    this.requestId = undefined;
  }

  /**
   * Cria um child logger com contexto adicional
   */
  child(context: LogContext): Logger {
    const childConfig: LoggerConfig = {
      ...this.config,
      context: { ...this.config.context, ...context },
    };

    return new Logger(childConfig);
  }

  /**
   * Verifica se o logger aceita um determinado nível
   */
  accepts(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Obtém o nível atual do logger
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Altera o nível do logger
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.pinoLogger.level = LOG_LEVEL_NAMES[level];
  }

  /**
   * Adiciona um transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove um transport
   */
  removeTransport(name: string): void {
    const index = this.transports.findIndex((t) => t.name === name);
    if (index !== -1) {
      this.transports.splice(index, 1);
    }
  }

  /**
   * Fecha todos os transports
   */
  async close(): Promise<void> {
    await Promise.all(this.transports.map((transport) => transport.close()));
  }

  /**
   * Força flush de todos os logs pendentes
   */
  flush(): void {
    this.pinoLogger.flush();
  }
}
