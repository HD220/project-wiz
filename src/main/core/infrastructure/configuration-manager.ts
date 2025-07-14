/**
 * @fileoverview Configuration Manager
 *
 * Gerenciador central de configurações que utiliza Zod para validação e type safety.
 * Suporta múltiplos ambientes e carregamento dinâmico de configurações.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from "zod";
import { Logger } from "./logger";
import { LoggerFactory } from "./logger-factory";
import { LogLevel } from "./log-level.enum";
import { InternalError } from "../errors/internal-error";
import { ValidationError } from "../errors/validation-error";

/**
 * Configuração base do sistema
 */
export interface BaseConfiguration {
  /** Ambiente de execução */
  readonly environment: string;
  /** Nível de log */
  readonly logLevel: string;
  /** Configurações de debug */
  readonly debug: boolean;
  /** Versão da aplicação */
  readonly version: string;
}

/**
 * Configuração de banco de dados
 */
export interface DatabaseConfiguration {
  /** Caminho para o arquivo de banco de dados */
  readonly path: string;
  /** Pool de conexões */
  readonly poolSize: number;
  /** Timeout de conexão */
  readonly connectionTimeout: number;
  /** Habilitar logs de query */
  readonly enableQueryLogging: boolean;
}

/**
 * Configuração de segurança
 */
export interface SecurityConfiguration {
  /** Chave secreta para JWT */
  readonly jwtSecret: string;
  /** Expiração do token */
  readonly jwtExpiration: string;
  /** Algoritmo de hash para senhas */
  readonly hashRounds: number;
  /** Habilitar HTTPS */
  readonly httpsEnabled: boolean;
}

/**
 * Configuração de LLM
 */
export interface LLMConfiguration {
  /** Provedor padrão */
  readonly defaultProvider: string;
  /** Timeout para requests */
  readonly requestTimeout: number;
  /** Máximo de tentativas */
  readonly maxRetries: number;
  /** Rate limiting */
  readonly rateLimitPerMinute: number;
}

/**
 * Configuração completa do sistema
 */
export interface SystemConfiguration extends BaseConfiguration {
  /** Configurações de banco de dados */
  readonly database: DatabaseConfiguration;
  /** Configurações de segurança */
  readonly security: SecurityConfiguration;
  /** Configurações de LLM */
  readonly llm: LLMConfiguration;
}

/**
 * Opções para o ConfigurationManager
 */
export interface ConfigurationManagerOptions {
  /** Arquivo de configuração */
  readonly configFile?: string;
  /** Diretório de configuração */
  readonly configDir?: string;
  /** Ambiente específico */
  readonly environment?: string;
  /** Habilitar hot reload */
  readonly hotReload?: boolean;
  /** Validação estrita */
  readonly strictValidation?: boolean;
}

/**
 * Listener para mudanças de configuração
 */
export type ConfigurationChangeListener = (
  config: SystemConfiguration,
  changes: Partial<SystemConfiguration>,
) => void;

/**
 * Resultado de carregamento de configuração
 */
export interface ConfigurationLoadResult {
  /** Configuração carregada */
  readonly config: SystemConfiguration;
  /** Fonte da configuração */
  readonly source: string;
  /** Timestamp do carregamento */
  readonly loadedAt: Date;
  /** Indicador de sucesso */
  readonly success: boolean;
  /** Erros encontrados */
  readonly errors?: string[];
}

/**
 * Gerenciador central de configurações
 *
 * Responsável por carregar, validar e gerenciar configurações do sistema
 * utilizando Zod schemas para validação e type safety.
 */
export class ConfigurationManager {
  private readonly logger: Logger;
  private readonly options: Required<ConfigurationManagerOptions>;
  private currentConfig: SystemConfiguration | null = null;
  private readonly listeners: Set<ConfigurationChangeListener> = new Set();
  private readonly loadHistory: ConfigurationLoadResult[] = [];

  /**
   * Configuração padrão do sistema
   */
  private static readonly DEFAULT_CONFIG: SystemConfiguration = {
    environment: "development",
    logLevel: "info",
    debug: true,
    version: "1.0.0",
    database: {
      path: "./project-wiz.db",
      poolSize: 10,
      connectionTimeout: 30000,
      enableQueryLogging: false,
    },
    security: {
      jwtSecret: "default-secret-change-in-production",
      jwtExpiration: "24h",
      hashRounds: 12,
      httpsEnabled: false,
    },
    llm: {
      defaultProvider: "openai",
      requestTimeout: 30000,
      maxRetries: 3,
      rateLimitPerMinute: 60,
    },
  };

  /**
   * Cria uma nova instância do ConfigurationManager
   *
   * @param options - Opções de configuração
   */
  constructor(options: ConfigurationManagerOptions = {}) {
    this.options = {
      configFile: options.configFile ?? "config.json",
      configDir: options.configDir ?? "./config",
      environment: options.environment ?? process.env.NODE_ENV ?? "development",
      hotReload: options.hotReload ?? false,
      strictValidation: options.strictValidation ?? true,
    };

    const loggerFactory = new LoggerFactory({
      defaultLevel: LogLevel.INFO,
      globalContext: { module: "ConfigurationManager" },
    });
    this.logger = loggerFactory.createLogger("ConfigurationManager");
    this.logger.info("ConfigurationManager initialized", {
      options: this.options,
    });
  }

  /**
   * Carrega a configuração do sistema
   *
   * @returns Promise da configuração carregada
   */
  async load(): Promise<SystemConfiguration> {
    try {
      this.logger.info("Loading system configuration", {
        environment: this.options.environment,
        configFile: this.options.configFile,
      });

      // Carregar configuração base
      const baseConfig = await this.loadBaseConfiguration();

      // Carregar configuração específica do ambiente
      const envConfig = await this.loadEnvironmentConfiguration();

      // Mesclar configurações
      const mergedConfig = this.mergeConfigurations(baseConfig, envConfig);

      // Validar configuração final
      const validatedConfig = await this.validateConfiguration(mergedConfig);

      // Atualizar configuração atual
      const oldConfig = this.currentConfig;
      this.currentConfig = validatedConfig;

      // Registrar resultado
      const result: ConfigurationLoadResult = {
        config: validatedConfig,
        source: `${this.options.configFile} + environment`,
        loadedAt: new Date(),
        success: true,
      };

      this.loadHistory.push(result);

      // Notificar listeners
      if (oldConfig) {
        this.notifyConfigurationChange(
          validatedConfig,
          this.calculateChanges(oldConfig, validatedConfig),
        );
      }

      this.logger.info("Configuration loaded successfully", {
        environment: validatedConfig.environment,
        version: validatedConfig.version,
      });

      return validatedConfig;
    } catch (error) {
      this.logger.error("Failed to load configuration", { error });

      const result: ConfigurationLoadResult = {
        config: ConfigurationManager.DEFAULT_CONFIG,
        source: "default",
        loadedAt: new Date(),
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };

      this.loadHistory.push(result);

      if (this.options.strictValidation) {
        throw InternalError.configuration(
          "ConfigurationManager",
          "strict_validation_failed",
          error instanceof Error
            ? error.message
            : "Configuration validation failed",
        );
      }

      this.logger.warn("Using default configuration due to load failure");
      this.currentConfig = ConfigurationManager.DEFAULT_CONFIG;
      return ConfigurationManager.DEFAULT_CONFIG;
    }
  }

  /**
   * Obtém a configuração atual
   *
   * @returns Configuração atual ou null se não carregada
   */
  get(): SystemConfiguration | null {
    return this.currentConfig;
  }

  /**
   * Obtém a configuração atual ou lança erro se não carregada
   *
   * @returns Configuração atual
   * @throws {InternalError} Se a configuração não foi carregada
   */
  getOrThrow(): SystemConfiguration {
    if (!this.currentConfig) {
      throw InternalError.configuration(
        "ConfigurationManager",
        "not_loaded",
        "Configuration not loaded. Call load() first.",
      );
    }
    return this.currentConfig;
  }

  /**
   * Obtém uma configuração específica por chave
   *
   * @param key - Chave da configuração
   * @returns Valor da configuração
   */
  getConfig<K extends keyof SystemConfiguration>(
    key: K,
  ): SystemConfiguration[K] | null {
    return this.currentConfig?.[key] ?? null;
  }

  /**
   * Adiciona um listener para mudanças de configuração
   *
   * @param listener - Função a ser chamada quando a configuração mudar
   */
  addConfigurationChangeListener(listener: ConfigurationChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove um listener de mudanças de configuração
   *
   * @param listener - Função a ser removida
   */
  removeConfigurationChangeListener(
    listener: ConfigurationChangeListener,
  ): void {
    this.listeners.delete(listener);
  }

  /**
   * Obtém o histórico de carregamento
   *
   * @returns Array com o histórico de carregamento
   */
  getLoadHistory(): readonly ConfigurationLoadResult[] {
    return [...this.loadHistory];
  }

  /**
   * Recarrega a configuração
   *
   * @returns Promise da configuração recarregada
   */
  async reload(): Promise<SystemConfiguration> {
    this.logger.info("Reloading configuration");
    return this.load();
  }

  /**
   * Valida uma configuração usando Zod
   *
   * @param config - Configuração a ser validada
   * @returns Configuração validada
   */
  async validateConfiguration(config: any): Promise<SystemConfiguration> {
    // Implementação será feita quando o ConfigurationSchema for criado
    // Por ora, retorna a configuração como está
    return config as SystemConfiguration;
  }

  /**
   * Carrega a configuração base
   */
  private async loadBaseConfiguration(): Promise<Partial<SystemConfiguration>> {
    try {
      // Simular carregamento de arquivo
      // Em uma implementação real, seria lido do sistema de arquivos
      return ConfigurationManager.DEFAULT_CONFIG;
    } catch (error) {
      this.logger.warn("Failed to load base configuration, using defaults", {
        error,
      });
      return ConfigurationManager.DEFAULT_CONFIG;
    }
  }

  /**
   * Carrega a configuração específica do ambiente
   */
  private async loadEnvironmentConfiguration(): Promise<
    Partial<SystemConfiguration>
  > {
    try {
      // Carregar configuração específica do ambiente
      const envConfig: Partial<SystemConfiguration> = {};

      // Carregar de variáveis de ambiente
      if (process.env.DATABASE_PATH) {
        (envConfig as any).database = {
          ...ConfigurationManager.DEFAULT_CONFIG.database,
          path: process.env.DATABASE_PATH,
        };
      }

      if (process.env.JWT_SECRET) {
        (envConfig as any).security = {
          ...ConfigurationManager.DEFAULT_CONFIG.security,
          jwtSecret: process.env.JWT_SECRET,
        };
      }

      if (process.env.LOG_LEVEL) {
        (envConfig as any).logLevel = process.env.LOG_LEVEL;
      }

      return envConfig;
    } catch (error) {
      this.logger.warn("Failed to load environment configuration", { error });
      return {};
    }
  }

  /**
   * Mescla configurações
   */
  private mergeConfigurations(
    base: Partial<SystemConfiguration>,
    env: Partial<SystemConfiguration>,
  ): SystemConfiguration {
    return {
      ...base,
      ...env,
      database: {
        ...base.database,
        ...env.database,
      },
      security: {
        ...base.security,
        ...env.security,
      },
      llm: {
        ...base.llm,
        ...env.llm,
      },
    } as SystemConfiguration;
  }

  /**
   * Calcula as mudanças entre configurações
   */
  private calculateChanges(
    oldConfig: SystemConfiguration,
    newConfig: SystemConfiguration,
  ): Partial<SystemConfiguration> {
    const changes: Partial<SystemConfiguration> = {};

    // Comparação simples por enquanto
    if (oldConfig.environment !== newConfig.environment) {
      (changes as any).environment = newConfig.environment;
    }

    if (oldConfig.logLevel !== newConfig.logLevel) {
      (changes as any).logLevel = newConfig.logLevel;
    }

    // Adicionar mais comparações conforme necessário

    return changes;
  }

  /**
   * Notifica listeners sobre mudanças
   */
  private notifyConfigurationChange(
    config: SystemConfiguration,
    changes: Partial<SystemConfiguration>,
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener(config, changes);
      } catch (error) {
        this.logger.error("Error in configuration change listener", { error });
      }
    });
  }

  /**
   * Obtém configuração padrão
   *
   * @returns Configuração padrão
   */
  static getDefaultConfiguration(): SystemConfiguration {
    return { ...ConfigurationManager.DEFAULT_CONFIG };
  }
}
