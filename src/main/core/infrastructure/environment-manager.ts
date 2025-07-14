/**
 * @fileoverview Environment Manager
 *
 * Gerenciador de ambientes que carrega e valida variáveis de ambiente
 * usando Zod schemas para type safety e validação.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from "zod";
import { Logger } from "./logger";
import { LoggerFactory } from "./logger-factory";
import { LogLevel } from "./log-level.enum";
import { ValidationError } from "../errors/validation-error";
import { InternalError } from "../errors/internal-error";
import {
  EnvironmentVariables,
  EnvironmentVariablesSchema,
  SystemConfiguration,
  ConfigurationSchemaUtils,
} from "./configuration-schema";

/**
 * Tipos de ambiente suportados
 */
export type EnvironmentType = "development" | "production" | "test" | "staging";

/**
 * Informações sobre o ambiente
 */
export interface EnvironmentInfo {
  /** Tipo do ambiente */
  readonly type: EnvironmentType;
  /** Indica se é ambiente de desenvolvimento */
  readonly isDevelopment: boolean;
  /** Indica se é ambiente de produção */
  readonly isProduction: boolean;
  /** Indica se é ambiente de teste */
  readonly isTest: boolean;
  /** Indica se é ambiente de staging */
  readonly isStaging: boolean;
  /** Timestamp de detecção do ambiente */
  readonly detectedAt: Date;
  /** Fonte de detecção do ambiente */
  readonly source: string;
}

/**
 * Opções para o EnvironmentManager
 */
export interface EnvironmentManagerOptions {
  /** Forçar um ambiente específico */
  readonly forceEnvironment?: EnvironmentType;
  /** Arquivo .env a ser carregado */
  readonly envFile?: string;
  /** Diretório onde procurar arquivos .env */
  readonly envDirectory?: string;
  /** Validação estrita de variáveis de ambiente */
  readonly strictValidation?: boolean;
  /** Variáveis de ambiente obrigatórias */
  readonly requiredVariables?: string[];
}

/**
 * Resultado de carregamento de variáveis de ambiente
 */
export interface EnvironmentLoadResult {
  /** Variáveis carregadas */
  readonly variables: EnvironmentVariables;
  /** Fonte das variáveis */
  readonly source: string;
  /** Timestamp do carregamento */
  readonly loadedAt: Date;
  /** Indicador de sucesso */
  readonly success: boolean;
  /** Erros encontrados */
  readonly errors?: string[];
  /** Avisos encontrados */
  readonly warnings?: string[];
}

/**
 * Configurações específicas por ambiente
 */
export interface EnvironmentSpecificConfig {
  /** Configuração de desenvolvimento */
  readonly development: Partial<SystemConfiguration>;
  /** Configuração de produção */
  readonly production: Partial<SystemConfiguration>;
  /** Configuração de teste */
  readonly test: Partial<SystemConfiguration>;
  /** Configuração de staging */
  readonly staging: Partial<SystemConfiguration>;
}

/**
 * Gerenciador de ambientes
 *
 * Responsável por detectar, carregar e validar variáveis de ambiente
 * e configurações específicas por ambiente.
 */
export class EnvironmentManager {
  private readonly logger: Logger;
  private readonly options: Omit<
    Required<EnvironmentManagerOptions>,
    "forceEnvironment"
  > & { forceEnvironment?: EnvironmentType };
  private currentEnvironment: EnvironmentInfo | null = null;
  private loadedVariables: EnvironmentVariables | null = null;
  private readonly loadHistory: EnvironmentLoadResult[] = [];

  /**
   * Configurações padrão por ambiente
   */
  private static readonly DEFAULT_ENV_CONFIG: EnvironmentSpecificConfig = {
    development: {
      logLevel: "debug",
      debug: true,
      database: {
        path: "./project-wiz-dev.db",
        poolSize: 10,
        connectionTimeout: 30000,
        enableQueryLogging: true,
      },
      security: {
        jwtSecret: "development-secret-key-min-32-chars",
        jwtExpiration: "24h",
        hashRounds: 12,
        httpsEnabled: false,
      },
    },
    production: {
      logLevel: "info",
      debug: false,
      database: {
        path: "./project-wiz.db",
        poolSize: 10,
        connectionTimeout: 30000,
        enableQueryLogging: false,
      },
      security: {
        jwtSecret: "MUST_BE_CHANGED_IN_PRODUCTION",
        jwtExpiration: "24h",
        httpsEnabled: true,
        hashRounds: 14,
      },
    },
    test: {
      logLevel: "warn",
      debug: false,
      database: {
        path: ":memory:",
        poolSize: 5,
        connectionTimeout: 10000,
        enableQueryLogging: false,
      },
      security: {
        jwtSecret: "test-secret-key-min-32-chars-long",
        jwtExpiration: "1h",
        httpsEnabled: false,
        hashRounds: 10,
      },
    },
    staging: {
      logLevel: "info",
      debug: false,
      database: {
        path: "./project-wiz-staging.db",
        poolSize: 10,
        connectionTimeout: 30000,
        enableQueryLogging: false,
      },
      security: {
        jwtSecret: "MUST_BE_CHANGED_IN_STAGING",
        jwtExpiration: "24h",
        httpsEnabled: true,
        hashRounds: 14,
      },
    },
  };

  /**
   * Cria uma nova instância do EnvironmentManager
   *
   * @param options - Opções do gerenciador
   */
  constructor(options: EnvironmentManagerOptions = {}) {
    this.options = {
      forceEnvironment: options.forceEnvironment,
      envFile: options.envFile ?? ".env",
      envDirectory: options.envDirectory ?? "./",
      strictValidation: options.strictValidation ?? true,
      requiredVariables: options.requiredVariables ?? [],
    };

    const loggerFactory = new LoggerFactory({
      defaultLevel: LogLevel.INFO,
      globalContext: { module: "EnvironmentManager" },
    });
    this.logger = loggerFactory.createLogger("EnvironmentManager");
    this.logger.info("EnvironmentManager initialized", {
      options: this.options,
    });
  }

  /**
   * Detecta o ambiente atual
   *
   * @returns Informações sobre o ambiente
   */
  detectEnvironment(): EnvironmentInfo {
    try {
      this.logger.debug("Detecting current environment");

      let environmentType: EnvironmentType;
      let source: string;

      if (this.options.forceEnvironment) {
        environmentType = this.options.forceEnvironment;
        source = "forced";
      } else if (process.env.NODE_ENV) {
        environmentType = process.env.NODE_ENV as EnvironmentType;
        source = "NODE_ENV";
      } else {
        environmentType = "development";
        source = "default";
      }

      // Validar se o ambiente é suportado
      if (
        !["development", "production", "test", "staging"].includes(
          environmentType,
        )
      ) {
        this.logger.warn(
          `Unknown environment type: ${environmentType}, defaulting to development`,
        );
        environmentType = "development";
        source = "default_fallback";
      }

      const environmentInfo: EnvironmentInfo = {
        type: environmentType,
        isDevelopment: environmentType === "development",
        isProduction: environmentType === "production",
        isTest: environmentType === "test",
        isStaging: environmentType === "staging",
        detectedAt: new Date(),
        source,
      };

      this.currentEnvironment = environmentInfo;

      this.logger.info("Environment detected", {
        environment: environmentType,
        source,
      });

      return environmentInfo;
    } catch (error) {
      this.logger.error("Failed to detect environment", { error });
      throw InternalError.configuration(
        "EnvironmentManager",
        "detection_failed",
        error instanceof Error ? error.message : "Environment detection failed",
      );
    }
  }

  /**
   * Carrega variáveis de ambiente
   *
   * @returns Resultado do carregamento
   */
  async loadEnvironmentVariables(): Promise<EnvironmentLoadResult> {
    try {
      this.logger.debug("Loading environment variables");

      const startTime = Date.now();
      const warnings: string[] = [];
      const errors: string[] = [];

      // Carregar variáveis do processo
      const processVariables = { ...process.env };

      // Carregar variáveis de arquivo .env se existir
      await this.loadEnvFile(processVariables);

      // Validar variáveis obrigatórias
      this.validateRequiredVariables(processVariables, errors);

      // Validar usando Zod schema
      const validationResult =
        ConfigurationSchemaUtils.validateEnvironmentVariables(processVariables);

      if (!validationResult.success) {
        const zodErrors = validationResult.error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        errors.push(...zodErrors);

        if (this.options.strictValidation) {
          throw ValidationError.multipleFields(
            zodErrors.map((err) => ({
              field: err.split(":")[0],
              rule: "zod_validation",
              message: err.split(":")[1]?.trim() || "Invalid value",
            })),
            "Environment variables validation failed",
          );
        }
      }

      const loadedVariables = validationResult.success
        ? validationResult.data
        : {};
      this.loadedVariables = loadedVariables;

      // Detectar variáveis sensíveis não configuradas
      this.detectSensitiveVariables(loadedVariables, warnings);

      const result: EnvironmentLoadResult = {
        variables: loadedVariables,
        source: "process.env + .env",
        loadedAt: new Date(),
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      this.loadHistory.push(result);

      this.logger.info("Environment variables loaded", {
        variableCount: Object.keys(loadedVariables).length,
        loadTime: Date.now() - startTime,
        success: result.success,
        errorCount: errors.length,
        warningCount: warnings.length,
      });

      return result;
    } catch (error) {
      this.logger.error("Failed to load environment variables", { error });

      const result: EnvironmentLoadResult = {
        variables: {},
        source: "error",
        loadedAt: new Date(),
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };

      this.loadHistory.push(result);

      if (this.options.strictValidation) {
        throw error;
      }

      return result;
    }
  }

  /**
   * Obtém o ambiente atual
   *
   * @returns Informações sobre o ambiente ou null se não detectado
   */
  getCurrentEnvironment(): EnvironmentInfo | null {
    return this.currentEnvironment;
  }

  /**
   * Obtém as variáveis de ambiente carregadas
   *
   * @returns Variáveis de ambiente ou null se não carregadas
   */
  getLoadedVariables(): EnvironmentVariables | null {
    return this.loadedVariables;
  }

  /**
   * Obtém configuração específica para o ambiente atual
   *
   * @returns Configuração específica do ambiente
   */
  getEnvironmentSpecificConfig(): Partial<SystemConfiguration> {
    if (!this.currentEnvironment) {
      this.detectEnvironment();
    }

    const environmentType = this.currentEnvironment!.type;
    return EnvironmentManager.DEFAULT_ENV_CONFIG[environmentType];
  }

  /**
   * Verifica se uma variável de ambiente existe
   *
   * @param name - Nome da variável
   * @returns True se a variável existe
   */
  hasEnvironmentVariable(name: string): boolean {
    return (
      this.loadedVariables?.[name as keyof EnvironmentVariables] !== undefined
    );
  }

  /**
   * Obtém uma variável de ambiente
   *
   * @param name - Nome da variável
   * @returns Valor da variável ou undefined
   */
  getEnvironmentVariable(name: keyof EnvironmentVariables): string | undefined {
    const value = this.loadedVariables?.[name];
    return typeof value === "string" ? value : undefined;
  }

  /**
   * Obtém o histórico de carregamento
   *
   * @returns Array com o histórico de carregamento
   */
  getLoadHistory(): readonly EnvironmentLoadResult[] {
    return [...this.loadHistory];
  }

  /**
   * Verifica se o ambiente é de desenvolvimento
   *
   * @returns True se for desenvolvimento
   */
  isDevelopment(): boolean {
    return this.currentEnvironment?.isDevelopment ?? false;
  }

  /**
   * Verifica se o ambiente é de produção
   *
   * @returns True se for produção
   */
  isProduction(): boolean {
    return this.currentEnvironment?.isProduction ?? false;
  }

  /**
   * Verifica se o ambiente é de teste
   *
   * @returns True se for teste
   */
  isTest(): boolean {
    return this.currentEnvironment?.isTest ?? false;
  }

  /**
   * Verifica se o ambiente é de staging
   *
   * @returns True se for staging
   */
  isStaging(): boolean {
    return this.currentEnvironment?.isStaging ?? false;
  }

  /**
   * Carrega arquivo .env
   */
  private async loadEnvFile(
    variables: Record<string, string | undefined>,
  ): Promise<void> {
    try {
      // Simulação de carregamento de arquivo .env
      // Em uma implementação real, usaria uma biblioteca como dotenv
      this.logger.debug("Loading .env file", { envFile: this.options.envFile });

      // Por enquanto, não fazemos nada aqui
      // A implementação real carregaria do sistema de arquivos
    } catch (error) {
      this.logger.warn("Failed to load .env file", { error });
    }
  }

  /**
   * Valida variáveis obrigatórias
   */
  private validateRequiredVariables(
    variables: Record<string, string | undefined>,
    errors: string[],
  ): void {
    for (const required of this.options.requiredVariables) {
      if (!variables[required]) {
        errors.push(`Required environment variable '${required}' is not set`);
      }
    }
  }

  /**
   * Detecta variáveis sensíveis não configuradas
   */
  private detectSensitiveVariables(
    variables: EnvironmentVariables,
    warnings: string[],
  ): void {
    const sensitiveVars = ["JWT_SECRET", "OPENAI_API_KEY", "DEEPSEEK_API_KEY"];

    for (const sensitiveVar of sensitiveVars) {
      if (
        !variables[sensitiveVar as keyof EnvironmentVariables] &&
        this.currentEnvironment?.isProduction
      ) {
        warnings.push(
          `Sensitive variable '${sensitiveVar}' is not set in production`,
        );
      }
    }
  }

  /**
   * Obtém configuração padrão por ambiente
   *
   * @returns Configuração padrão
   */
  static getDefaultEnvironmentConfig(): EnvironmentSpecificConfig {
    return { ...EnvironmentManager.DEFAULT_ENV_CONFIG };
  }
}
