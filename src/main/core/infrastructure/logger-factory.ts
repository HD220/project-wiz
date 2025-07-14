import { Logger, LoggerConfig } from "./logger";
import { LogLevel } from "./log-level.enum";
import { LogContext } from "./log-entry.interface";
import { LogTransport } from "./log-transport.interface";
import { ConsoleTransport } from "./console-transport";
import { FileTransport } from "./file-transport";

/**
 * Configuração do LoggerFactory
 */
export interface LoggerFactoryConfig {
  /** Nível padrão de log */
  defaultLevel: LogLevel;

  /** Contexto global */
  globalContext?: LogContext;

  /** Transports padrão */
  transports?: LogTransport[];

  /** Configurações específicas por módulo */
  moduleConfigs?: Record<string, Partial<LoggerConfig>>;

  /** Configurações de ambiente */
  environment?: {
    /** Ambiente atual */
    env: "development" | "production" | "test";

    /** Usar pretty print em desenvolvimento */
    prettyInDev: boolean;

    /** Caminho base para logs */
    logPath?: string;

    /** Habilitar file transport em produção */
    fileInProduction: boolean;
  };
}

/**
 * Factory para criação de loggers centralizados
 *
 * Fornece uma interface centralizada para criar e gerenciar
 * loggers com configurações consistentes e child loggers.
 *
 * @example
 * ```typescript
 * const factory = new LoggerFactory({
 *   defaultLevel: LogLevel.INFO,
 *   globalContext: { app: 'project-wiz' },
 *   environment: {
 *     env: 'development',
 *     prettyInDev: true,
 *     fileInProduction: true
 *   }
 * });
 *
 * const logger = factory.createLogger('user-service');
 * const childLogger = factory.createChildLogger(logger, { operation: 'create' });
 * ```
 */
export class LoggerFactory {
  private readonly config: LoggerFactoryConfig;
  private readonly loggers = new Map<string, Logger>();
  private readonly defaultTransports: LogTransport[] = [];
  private static instance?: LoggerFactory;

  constructor(config: LoggerFactoryConfig) {
    this.config = config;
    this.initializeDefaultTransports();
  }

  /**
   * Inicializa transports padrão baseado na configuração
   */
  private initializeDefaultTransports(): void {
    const env = this.config.environment?.env || "development";

    // Console transport sempre presente
    const consoleTransport = new ConsoleTransport({
      level: this.config.defaultLevel,
      pretty:
        env === "development" && this.config.environment?.prettyInDev !== false,
      colors: true,
      prettyOptions: {
        colorize: true,
        translateTime: true,
        ignore: "pid,hostname",
        hideObject: false,
      },
    });

    this.defaultTransports.push(consoleTransport);

    // File transport em produção
    if (env === "production" && this.config.environment?.fileInProduction) {
      const logPath = this.config.environment.logPath || "./logs";
      const fileTransport = new FileTransport({
        level: this.config.defaultLevel,
        filePath: `${logPath}/application.log`,
        rotation: {
          enabled: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          compress: true,
        },
        performance: {
          buffer: true,
          bufferSize: 1000,
          flushTimeout: 5000,
          async: true,
        },
      });

      this.defaultTransports.push(fileTransport);
    }

    // Adicionar transports customizados
    if (this.config.transports) {
      this.defaultTransports.push(...this.config.transports);
    }
  }

  /**
   * Cria um logger para um módulo específico
   */
  createLogger(module: string, additionalContext?: LogContext): Logger {
    const cacheKey = `${module}:${JSON.stringify(additionalContext)}`;

    if (this.loggers.has(cacheKey)) {
      return this.loggers.get(cacheKey)!;
    }

    // Configuração específica do módulo
    const moduleConfig = this.config.moduleConfigs?.[module] || {};

    // Contexto combinado
    const context: LogContext = {
      ...this.config.globalContext,
      module,
      ...additionalContext,
    };

    // Configuração do logger
    const loggerConfig: LoggerConfig = {
      level: moduleConfig.level || this.config.defaultLevel,
      name: module,
      context,
      transports: [
        ...this.defaultTransports,
        ...(moduleConfig.transports || []),
      ],
      ...moduleConfig,
    };

    const logger = new Logger(loggerConfig);
    this.loggers.set(cacheKey, logger);

    return logger;
  }

  /**
   * Cria um child logger com contexto adicional
   */
  createChildLogger(
    parentLogger: Logger,
    additionalContext: LogContext,
  ): Logger {
    return parentLogger.child(additionalContext);
  }

  /**
   * Cria um logger para uma classe específica
   */
  createClassLogger(
    className: string,
    module?: string,
    additionalContext?: LogContext,
  ): Logger {
    const context: LogContext = {
      class: className,
      ...additionalContext,
    };

    return this.createLogger(module || className, context);
  }

  /**
   * Cria um logger para uma operação específica
   */
  createOperationLogger(
    operation: string,
    module?: string,
    additionalContext?: LogContext,
  ): Logger {
    const context: LogContext = {
      operation,
      ...additionalContext,
    };

    return this.createLogger(module || operation, context);
  }

  /**
   * Cria um logger para requisições HTTP
   */
  createRequestLogger(requestId: string, module?: string): Logger {
    const context: LogContext = {
      requestId,
      type: "http-request",
    };

    const logger = this.createLogger(module || "http", context);
    logger.setRequestId(requestId);

    return logger;
  }

  /**
   * Obtém logger existente ou cria novo
   */
  getLogger(module: string, additionalContext?: LogContext): Logger {
    return this.createLogger(module, additionalContext);
  }

  /**
   * Altera nível de log globalmente
   */
  setGlobalLevel(level: LogLevel): void {
    this.config.defaultLevel = level;

    // Atualizar todos os loggers existentes
    for (const logger of this.loggers.values()) {
      logger.setLevel(level);
    }
  }

  /**
   * Altera nível de log para um módulo específico
   */
  setModuleLevel(module: string, level: LogLevel): void {
    if (!this.config.moduleConfigs) {
      this.config.moduleConfigs = {};
    }

    if (!this.config.moduleConfigs[module]) {
      this.config.moduleConfigs[module] = {};
    }

    this.config.moduleConfigs[module].level = level;

    // Atualizar loggers existentes do módulo
    for (const [key, logger] of this.loggers.entries()) {
      if (key.startsWith(`${module}:`)) {
        logger.setLevel(level);
      }
    }
  }

  /**
   * Adiciona transport global
   */
  addGlobalTransport(transport: LogTransport): void {
    this.defaultTransports.push(transport);

    // Adicionar aos loggers existentes
    for (const logger of this.loggers.values()) {
      logger.addTransport(transport);
    }
  }

  /**
   * Remove transport global
   */
  removeGlobalTransport(transportName: string): void {
    const index = this.defaultTransports.findIndex(
      (t) => t.name === transportName,
    );
    if (index !== -1) {
      this.defaultTransports.splice(index, 1);
    }

    // Remover dos loggers existentes
    for (const logger of this.loggers.values()) {
      logger.removeTransport(transportName);
    }
  }

  /**
   * Limpa cache de loggers
   */
  clearCache(): void {
    this.loggers.clear();
  }

  /**
   * Fecha todos os loggers e transports
   */
  async shutdown(): Promise<void> {
    // Fechar todos os loggers
    await Promise.all(
      Array.from(this.loggers.values()).map((logger) => logger.close()),
    );

    // Fechar transports padrão
    await Promise.all(
      this.defaultTransports.map((transport) => transport.close()),
    );

    this.loggers.clear();
  }

  /**
   * Obtém estatísticas de todos os loggers
   */
  getStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {
      totalLoggers: this.loggers.size,
      defaultTransports: this.defaultTransports.length,
      moduleConfigs: Object.keys(this.config.moduleConfigs || {}).length,
    };

    // Estatísticas dos transports
    for (const transport of this.defaultTransports) {
      if ("getStats" in transport) {
        stats[`transport_${transport.name}`] = (
          transport as { getStats(): unknown }
        ).getStats();
      }
    }

    return stats;
  }

  /**
   * Obtém instância singleton (opcional)
   */
  static getInstance(): LoggerFactory | undefined {
    return LoggerFactory.instance;
  }

  /**
   * Configura instância singleton
   */
  static setInstance(config: LoggerFactoryConfig): LoggerFactory {
    LoggerFactory.instance = new LoggerFactory(config);
    return LoggerFactory.instance;
  }

  /**
   * Configuração padrão para desenvolvimento
   */
  static createDevelopmentConfig(): LoggerFactoryConfig {
    return {
      defaultLevel: LogLevel.DEBUG,
      globalContext: {
        app: "project-wiz",
        env: "development",
      },
      environment: {
        env: "development",
        prettyInDev: true,
        fileInProduction: false,
      },
    };
  }

  /**
   * Configuração padrão para produção
   */
  static createProductionConfig(logPath?: string): LoggerFactoryConfig {
    return {
      defaultLevel: LogLevel.INFO,
      globalContext: {
        app: "project-wiz",
        env: "production",
      },
      environment: {
        env: "production",
        prettyInDev: false,
        logPath: logPath || "./logs",
        fileInProduction: true,
      },
    };
  }
}
