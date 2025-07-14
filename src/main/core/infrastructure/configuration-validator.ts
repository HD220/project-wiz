/**
 * @fileoverview Configuration Validator
 *
 * Validador de configurações usando Zod schemas com validação customizada
 * e regras de negócio específicas.
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
  SystemConfiguration,
  SystemConfigurationSchema,
  ConfigurationSchemaUtils,
  EnvironmentVariables,
} from "./configuration-schema";

/**
 * Resultado de validação de configuração
 */
export interface ConfigurationValidationResult {
  /** Indica se a validação foi bem-sucedida */
  readonly success: boolean;
  /** Configuração validada (se sucesso) */
  readonly data?: SystemConfiguration;
  /** Erros de validação */
  readonly errors: ValidationError[];
  /** Avisos de validação */
  readonly warnings: string[];
  /** Timestamp da validação */
  readonly validatedAt: Date;
  /** Contexto da validação */
  readonly context: string;
}

/**
 * Opções de validação
 */
export interface ValidationOptions {
  /** Modo de validação estrito */
  readonly strict?: boolean;
  /** Ambiente alvo */
  readonly environment?: string;
  /** Pular validações específicas */
  readonly skipValidations?: string[];
  /** Validações customizadas */
  readonly customValidations?: ValidationRule[];
}

/**
 * Regra de validação customizada
 */
export interface ValidationRule {
  /** Nome da regra */
  readonly name: string;
  /** Descrição da regra */
  readonly description: string;
  /** Função de validação */
  readonly validate: (config: SystemConfiguration) => ValidationRuleResult;
  /** Nível de severidade */
  readonly severity: "error" | "warning" | "info";
  /** Categoria da regra */
  readonly category: string;
}

/**
 * Resultado de uma regra de validação
 */
export interface ValidationRuleResult {
  /** Indica se a regra passou */
  readonly passed: boolean;
  /** Mensagem de erro/aviso */
  readonly message?: string;
  /** Detalhes adicionais */
  readonly details?: Record<string, any>;
  /** Campo relacionado */
  readonly field?: string;
}

/**
 * Contexto de validação
 */
export interface ValidationContext {
  /** Ambiente sendo validado */
  readonly environment: string;
  /** Timestamp de início */
  readonly startTime: Date;
  /** Opções de validação */
  readonly options: ValidationOptions;
  /** Regras aplicadas */
  readonly appliedRules: string[];
}

/**
 * Validador de configurações
 *
 * Responsável por validar configurações usando Zod schemas
 * e regras de negócio customizadas.
 */
export class ConfigurationValidator {
  private readonly logger: Logger;
  private readonly customRules: Map<string, ValidationRule> = new Map();
  private readonly validationHistory: ConfigurationValidationResult[] = [];

  /**
   * Regras de validação padrão
   */
  private static readonly DEFAULT_RULES: ValidationRule[] = [
    {
      name: "production-security",
      description: "Verifica configurações de segurança em produção",
      category: "security",
      severity: "error",
      validate: (config) => {
        if (config.environment === "production") {
          // Verificar JWT secret não é padrão
          if (
            config.security.jwtSecret === "default-secret-change-in-production"
          ) {
            return {
              passed: false,
              message: "JWT secret must be changed in production",
              field: "security.jwtSecret",
            };
          }

          // Verificar HTTPS habilitado
          if (!config.security.httpsEnabled) {
            return {
              passed: false,
              message: "HTTPS must be enabled in production",
              field: "security.httpsEnabled",
            };
          }

          // Verificar debug desabilitado
          if (config.debug) {
            return {
              passed: false,
              message: "Debug mode must be disabled in production",
              field: "debug",
            };
          }
        }

        return { passed: true };
      },
    },
    {
      name: "database-path",
      description: "Verifica se o caminho do banco de dados é válido",
      category: "database",
      severity: "error",
      validate: (config) => {
        if (
          config.database.path === ":memory:" &&
          config.environment === "production"
        ) {
          return {
            passed: false,
            message: "In-memory database not allowed in production",
            field: "database.path",
          };
        }

        return { passed: true };
      },
    },
    {
      name: "llm-configuration",
      description: "Verifica configurações do LLM",
      category: "llm",
      severity: "warning",
      validate: (config) => {
        if (config.llm.requestTimeout > 300000) {
          return {
            passed: false,
            message: "LLM request timeout is very high (>5 minutes)",
            field: "llm.requestTimeout",
          };
        }

        if (config.llm.rateLimitPerMinute > 1000) {
          return {
            passed: false,
            message: "LLM rate limit is very high (>1000/min)",
            field: "llm.rateLimitPerMinute",
          };
        }

        return { passed: true };
      },
    },
    {
      name: "log-level-consistency",
      description: "Verifica consistência do nível de log",
      category: "logging",
      severity: "warning",
      validate: (config) => {
        if (
          config.environment === "production" &&
          config.logLevel === "debug"
        ) {
          return {
            passed: false,
            message: "Debug log level not recommended in production",
            field: "logLevel",
          };
        }

        return { passed: true };
      },
    },
    {
      name: "performance-settings",
      description: "Verifica configurações de performance",
      category: "performance",
      severity: "info",
      validate: (config) => {
        if (config.database.poolSize > 50) {
          return {
            passed: false,
            message: "Database pool size is very high, consider reducing",
            field: "database.poolSize",
          };
        }

        return { passed: true };
      },
    },
  ];

  /**
   * Cria uma nova instância do ConfigurationValidator
   */
  constructor() {
    const loggerFactory = new LoggerFactory({
      defaultLevel: LogLevel.INFO,
      globalContext: { module: "ConfigurationValidator" },
    });
    this.logger = loggerFactory.createLogger("ConfigurationValidator");

    // Registrar regras padrão
    for (const rule of ConfigurationValidator.DEFAULT_RULES) {
      this.customRules.set(rule.name, rule);
    }

    this.logger.info("ConfigurationValidator initialized", {
      defaultRulesCount: ConfigurationValidator.DEFAULT_RULES.length,
    });
  }

  /**
   * Valida uma configuração completa
   *
   * @param config - Configuração a ser validada
   * @param options - Opções de validação
   * @returns Resultado da validação
   */
  async validate(
    config: unknown,
    options: ValidationOptions = {},
  ): Promise<ConfigurationValidationResult> {
    const context: ValidationContext = {
      environment: options.environment || "unknown",
      startTime: new Date(),
      options,
      appliedRules: [],
    };

    try {
      this.logger.debug("Starting configuration validation", {
        environment: context.environment,
        strict: options.strict ?? false,
      });

      const errors: ValidationError[] = [];
      const warnings: string[] = [];

      // Validação básica com Zod
      const zodResult = await this.validateWithZod(
        config,
        context.environment,
        errors,
      );

      if (!zodResult.success) {
        const result: ConfigurationValidationResult = {
          success: false,
          errors,
          warnings,
          validatedAt: new Date(),
          context: context.environment,
        };

        this.validationHistory.push(result);
        return result;
      }

      const validatedConfig = zodResult.data!;

      // Validação com regras customizadas
      await this.validateWithCustomRules(
        validatedConfig,
        context,
        errors,
        warnings,
      );

      // Validação de consistência
      await this.validateConsistency(
        validatedConfig,
        context,
        errors,
        warnings,
      );

      const success = errors.length === 0;
      const result: ConfigurationValidationResult = {
        success,
        data: success ? validatedConfig : undefined,
        errors,
        warnings,
        validatedAt: new Date(),
        context: context.environment,
      };

      this.validationHistory.push(result);

      this.logger.info("Configuration validation completed", {
        success,
        errorCount: errors.length,
        warningCount: warnings.length,
        rulesApplied: context.appliedRules.length,
      });

      return result;
    } catch (error) {
      this.logger.error("Configuration validation failed", { error });

      const result: ConfigurationValidationResult = {
        success: false,
        errors: [
          ValidationError.invalidFormat(
            "configuration",
            "validation_failed",
            error instanceof Error ? error.message : "Validation failed",
          ),
        ],
        warnings: [],
        validatedAt: new Date(),
        context: context.environment,
      };

      this.validationHistory.push(result);
      return result;
    }
  }

  /**
   * Valida configuração para ambiente específico
   *
   * @param config - Configuração a ser validada
   * @param environment - Ambiente alvo
   * @param options - Opções de validação
   * @returns Resultado da validação
   */
  async validateForEnvironment(
    config: unknown,
    environment: string,
    options: ValidationOptions = {},
  ): Promise<ConfigurationValidationResult> {
    return this.validate(config, {
      ...options,
      environment,
    });
  }

  /**
   * Adiciona uma regra de validação customizada
   *
   * @param rule - Regra a ser adicionada
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.set(rule.name, rule);
    this.logger.debug("Custom validation rule added", {
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
    });
  }

  /**
   * Remove uma regra de validação customizada
   *
   * @param name - Nome da regra a ser removida
   */
  removeCustomRule(name: string): void {
    this.customRules.delete(name);
    this.logger.debug("Custom validation rule removed", { name });
  }

  /**
   * Obtém todas as regras de validação
   *
   * @returns Array com todas as regras
   */
  getValidationRules(): ValidationRule[] {
    return Array.from(this.customRules.values());
  }

  /**
   * Obtém histórico de validações
   *
   * @returns Array com histórico de validações
   */
  getValidationHistory(): readonly ConfigurationValidationResult[] {
    return [...this.validationHistory];
  }

  /**
   * Valida configuração usando Zod
   */
  private async validateWithZod(
    config: unknown,
    environment: string,
    errors: ValidationError[],
  ): Promise<{ success: boolean; data?: SystemConfiguration }> {
    try {
      const result = ConfigurationSchemaUtils.validateForEnvironment(
        config,
        environment,
      );

      if (!result.success) {
        for (const error of result.error.errors) {
          errors.push(
            ValidationError.invalidFormat(
              error.path.join("."),
              String(error.code),
              error.message,
            ),
          );
        }
        return { success: false };
      }

      return { success: true, data: result.data };
    } catch (error) {
      errors.push(
        ValidationError.invalidFormat(
          "configuration",
          config,
          error instanceof Error ? error.message : "Schema validation failed",
        ),
      );
      return { success: false };
    }
  }

  /**
   * Valida usando regras customizadas
   */
  private async validateWithCustomRules(
    config: SystemConfiguration,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: string[],
  ): Promise<void> {
    const skipValidations = context.options.skipValidations || [];

    for (const [name, rule] of this.customRules) {
      if (skipValidations.includes(name)) {
        continue;
      }

      try {
        const result = rule.validate(config);
        context.appliedRules.push(name);

        if (!result.passed) {
          if (rule.severity === "error") {
            errors.push(
              ValidationError.invalidFormat(
                result.field || name,
                "configuration",
                result.message || "Custom validation failed",
              ),
            );
          } else {
            warnings.push(
              `${rule.category}: ${result.message || "Custom validation warning"}`,
            );
          }
        }
      } catch (error) {
        this.logger.error("Error executing custom validation rule", {
          rule: name,
          error,
        });

        errors.push(
          ValidationError.invalidFormat(
            name,
            "rule_execution",
            `Custom rule '${name}' failed to execute`,
          ),
        );
      }
    }
  }

  /**
   * Valida consistência da configuração
   */
  private async validateConsistency(
    config: SystemConfiguration,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: string[],
  ): Promise<void> {
    // Verificar consistência entre configurações
    if (config.environment === "production" && config.debug) {
      warnings.push("Debug mode enabled in production environment");
    }

    // Verificar limites de timeout
    if (config.llm.requestTimeout > config.database.connectionTimeout) {
      warnings.push(
        "LLM request timeout is higher than database connection timeout",
      );
    }

    // Verificar configurações de segurança
    if (config.security.hashRounds < 10) {
      warnings.push("Hash rounds below recommended minimum (10)");
    }

    // Verificar se JWT expiration é válido
    const jwtExpirationPattern = /^\d+[smhd]$/;
    if (!jwtExpirationPattern.test(config.security.jwtExpiration)) {
      errors.push(
        ValidationError.invalidFormat(
          "security.jwtExpiration",
          config.security.jwtExpiration,
          "JWT expiration format must be like: 1h, 30m, 7d, 60s",
        ),
      );
    }
  }

  /**
   * Obtém regras padrão
   *
   * @returns Array com regras padrão
   */
  static getDefaultRules(): ValidationRule[] {
    return [...ConfigurationValidator.DEFAULT_RULES];
  }
}
