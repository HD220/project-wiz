/**
 * @fileoverview Validation Rules
 *
 * Sistema de regras de validação customizadas com suporte a composição,
 * priorização e execução condicional usando Zod.
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

/**
 * Severidade da regra de validação
 */
export type ValidationRuleSeverity = "error" | "warning" | "info";

/**
 * Contexto de execução da regra
 */
export interface ValidationRuleContext {
  /** Dados sendo validados */
  readonly data: unknown;
  /** Campo específico sendo validado */
  readonly field?: string;
  /** Ambiente atual */
  readonly environment?: string;
  /** Metadados adicionais */
  readonly metadata?: Record<string, unknown>;
  /** Timestamp de execução */
  readonly timestamp: Date;
}

/**
 * Resultado da execução de uma regra
 */
export interface ValidationRuleResult {
  /** Indica se a regra passou */
  readonly passed: boolean;
  /** Mensagem de erro/aviso */
  readonly message?: string;
  /** Detalhes adicionais */
  readonly details?: Record<string, unknown>;
  /** Campo relacionado */
  readonly field?: string;
  /** Código de erro */
  readonly code?: string;
  /** Sugestão para correção */
  readonly suggestion?: string;
}

/**
 * Configuração de uma regra de validação
 */
export interface ValidationRuleConfig {
  /** Nome único da regra */
  readonly name: string;
  /** Descrição da regra */
  readonly description: string;
  /** Categoria da regra */
  readonly category: string;
  /** Severidade */
  readonly severity: ValidationRuleSeverity;
  /** Prioridade de execução (menor = maior prioridade) */
  readonly priority: number;
  /** Indica se a regra está habilitada */
  readonly enabled: boolean;
  /** Condições para execução */
  readonly conditions?: ValidationRuleCondition[];
  /** Dependências de outras regras */
  readonly dependencies?: string[];
  /** Timeout para execução */
  readonly timeout?: number;
}

/**
 * Condição para execução de regra
 */
export interface ValidationRuleCondition {
  /** Tipo de condição */
  readonly type: "field" | "environment" | "data" | "custom";
  /** Operador de comparação */
  readonly operator: "equals" | "not_equals" | "contains" | "regex" | "custom";
  /** Valor para comparação */
  readonly value: unknown;
  /** Função customizada de condição */
  readonly customFunction?: (context: ValidationRuleContext) => boolean;
}

/**
 * Executor de regra de validação
 */
export type ValidationRuleExecutor = (
  context: ValidationRuleContext,
) => Promise<ValidationRuleResult> | ValidationRuleResult;

/**
 * Estatísticas de execução de regra
 */
export interface ValidationRuleStats {
  /** Número total de execuções */
  readonly totalExecutions: number;
  /** Número de execuções bem-sucedidas */
  readonly successfulExecutions: number;
  /** Número de execuções com falha */
  readonly failedExecutions: number;
  /** Tempo médio de execução */
  readonly averageExecutionTime: number;
  /** Última execução */
  readonly lastExecution?: Date;
  /** Taxa de sucesso */
  readonly successRate: number;
}

/**
 * Regra de validação customizada
 *
 * Representa uma regra de validação com configuração, condições
 * e executor personalizado.
 */
export class ValidationRule {
  private readonly logger: Logger;
  private readonly stats: ValidationRuleStats;
  private readonly config: ValidationRuleConfig;
  private readonly executor: ValidationRuleExecutor;

  /**
   * Cria uma nova regra de validação
   *
   * @param config - Configuração da regra
   * @param executor - Função executora da regra
   */
  constructor(config: ValidationRuleConfig, executor: ValidationRuleExecutor) {
    this.config = { ...config };
    this.executor = executor;
    const loggerFactory = new LoggerFactory({
      defaultLevel: LogLevel.INFO,
      globalContext: { module: `ValidationRule:${config.name}` },
    });
    this.logger = loggerFactory.createLogger(`ValidationRule:${config.name}`);

    // Inicializar estatísticas
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      successRate: 0,
    } as any;

    this.logger.debug("Validation rule created", {
      name: config.name,
      category: config.category,
      severity: config.severity,
      priority: config.priority,
    });
  }

  /**
   * Executa a regra de validação
   *
   * @param context - Contexto de execução
   * @returns Resultado da execução
   */
  async execute(context: ValidationRuleContext): Promise<ValidationRuleResult> {
    const startTime = Date.now();

    try {
      // Verificar se a regra está habilitada
      if (!this.config.enabled) {
        return {
          passed: true,
          message: "Rule is disabled",
          details: { disabled: true },
        };
      }

      // Verificar condições
      if (!this.checkConditions(context)) {
        return {
          passed: true,
          message: "Rule conditions not met",
          details: { conditionsNotMet: true },
        };
      }

      this.logger.debug("Executing validation rule", {
        name: this.config.name,
        field: context.field,
        environment: context.environment,
      });

      // Executar com timeout se configurado
      const result = this.config.timeout
        ? await this.executeWithTimeout(context)
        : await this.executor(context);

      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime);

      this.logger.debug("Validation rule executed", {
        name: this.config.name,
        passed: result.passed,
        executionTime,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime);

      this.logger.error("Validation rule execution failed", {
        name: this.config.name,
        error,
        executionTime,
      });

      return {
        passed: false,
        message: `Rule execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
        code: "RULE_EXECUTION_ERROR",
      };
    }
  }

  /**
   * Obtém a configuração da regra
   *
   * @returns Configuração da regra
   */
  getConfig(): ValidationRuleConfig {
    return { ...this.config };
  }

  /**
   * Obtém as estatísticas da regra
   *
   * @returns Estatísticas de execução
   */
  getStats(): ValidationRuleStats {
    return { ...this.stats };
  }

  /**
   * Verifica se a regra está habilitada
   *
   * @returns True se habilitada
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Obtém a prioridade da regra
   *
   * @returns Prioridade (menor = maior prioridade)
   */
  getPriority(): number {
    return this.config.priority;
  }

  /**
   * Obtém as dependências da regra
   *
   * @returns Array de dependências
   */
  getDependencies(): string[] {
    return [...(this.config.dependencies || [])];
  }

  /**
   * Verifica se a regra pode ser executada
   *
   * @param context - Contexto de execução
   * @returns True se pode ser executada
   */
  canExecute(context: ValidationRuleContext): boolean {
    return this.config.enabled && this.checkConditions(context);
  }

  /**
   * Verifica condições de execução
   */
  private checkConditions(context: ValidationRuleContext): boolean {
    if (!this.config.conditions || this.config.conditions.length === 0) {
      return true;
    }

    return this.config.conditions.every((condition) => {
      switch (condition.type) {
        case "field":
          return this.checkFieldCondition(condition, context);
        case "environment":
          return this.checkEnvironmentCondition(condition, context);
        case "data":
          return this.checkDataCondition(condition, context);
        case "custom":
          return condition.customFunction
            ? condition.customFunction(context)
            : true;
        default:
          return true;
      }
    });
  }

  /**
   * Verifica condição de campo
   */
  private checkFieldCondition(
    condition: ValidationRuleCondition,
    context: ValidationRuleContext,
  ): boolean {
    const field = context.field;

    switch (condition.operator) {
      case "equals":
        return field === condition.value;
      case "not_equals":
        return field !== condition.value;
      case "contains":
        return field ? field.includes(String(condition.value)) : false;
      case "regex":
        return field ? new RegExp(String(condition.value)).test(field) : false;
      default:
        return true;
    }
  }

  /**
   * Verifica condição de ambiente
   */
  private checkEnvironmentCondition(
    condition: ValidationRuleCondition,
    context: ValidationRuleContext,
  ): boolean {
    const environment = context.environment;

    switch (condition.operator) {
      case "equals":
        return environment === condition.value;
      case "not_equals":
        return environment !== condition.value;
      case "contains":
        return environment
          ? environment.includes(String(condition.value))
          : false;
      default:
        return true;
    }
  }

  /**
   * Verifica condição de dados
   */
  private checkDataCondition(
    condition: ValidationRuleCondition,
    context: ValidationRuleContext,
  ): boolean {
    const data = context.data;

    switch (condition.operator) {
      case "equals":
        return data === condition.value;
      case "not_equals":
        return data !== condition.value;
      case "contains":
        return (
          typeof data === "string" && data.includes(String(condition.value))
        );
      case "regex":
        return (
          typeof data === "string" &&
          new RegExp(String(condition.value)).test(data)
        );
      default:
        return true;
    }
  }

  /**
   * Executa com timeout
   */
  private async executeWithTimeout(
    context: ValidationRuleContext,
  ): Promise<ValidationRuleResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(`Rule execution timeout after ${this.config.timeout}ms`),
        );
      }, this.config.timeout);

      Promise.resolve(this.executor(context))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Atualiza estatísticas
   */
  private updateStats(success: boolean, executionTime: number): void {
    const stats = this.stats as any;

    stats.totalExecutions++;
    stats.lastExecution = new Date();

    if (success) {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }

    stats.successRate = stats.successfulExecutions / stats.totalExecutions;

    // Calcular tempo médio
    stats.averageExecutionTime =
      (stats.averageExecutionTime * (stats.totalExecutions - 1) +
        executionTime) /
      stats.totalExecutions;
  }

  /**
   * Cria uma regra de validação para email
   *
   * @returns Regra de validação de email
   */
  static createEmailRule(): ValidationRule {
    return new ValidationRule(
      {
        name: "email-validation",
        description: "Validates email format",
        category: "format",
        severity: "error",
        priority: 1,
        enabled: true,
      },
      (context) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = String(context.data);

        if (!emailRegex.test(email)) {
          return {
            passed: false,
            message: "Invalid email format",
            field: context.field,
            code: "INVALID_EMAIL_FORMAT",
            suggestion: "Please provide a valid email address",
          };
        }

        return { passed: true };
      },
    );
  }

  /**
   * Cria uma regra de validação para senha
   *
   * @returns Regra de validação de senha
   */
  static createPasswordRule(): ValidationRule {
    return new ValidationRule(
      {
        name: "password-validation",
        description: "Validates password strength",
        category: "security",
        severity: "error",
        priority: 1,
        enabled: true,
      },
      (context) => {
        const password = String(context.data);

        if (password.length < 8) {
          return {
            passed: false,
            message: "Password must be at least 8 characters long",
            field: context.field,
            code: "PASSWORD_TOO_SHORT",
            suggestion: "Use at least 8 characters",
          };
        }

        if (!/[A-Z]/.test(password)) {
          return {
            passed: false,
            message: "Password must contain at least one uppercase letter",
            field: context.field,
            code: "PASSWORD_NO_UPPERCASE",
            suggestion: "Add at least one uppercase letter",
          };
        }

        if (!/[a-z]/.test(password)) {
          return {
            passed: false,
            message: "Password must contain at least one lowercase letter",
            field: context.field,
            code: "PASSWORD_NO_LOWERCASE",
            suggestion: "Add at least one lowercase letter",
          };
        }

        if (!/[0-9]/.test(password)) {
          return {
            passed: false,
            message: "Password must contain at least one number",
            field: context.field,
            code: "PASSWORD_NO_NUMBER",
            suggestion: "Add at least one number",
          };
        }

        return { passed: true };
      },
    );
  }

  /**
   * Cria uma regra de validação para UUID
   *
   * @returns Regra de validação de UUID
   */
  static createUUIDRule(): ValidationRule {
    return new ValidationRule(
      {
        name: "uuid-validation",
        description: "Validates UUID format",
        category: "format",
        severity: "error",
        priority: 1,
        enabled: true,
      },
      (context) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const uuid = String(context.data);

        if (!uuidRegex.test(uuid)) {
          return {
            passed: false,
            message: "Invalid UUID format",
            field: context.field,
            code: "INVALID_UUID_FORMAT",
            suggestion: "Please provide a valid UUID",
          };
        }

        return { passed: true };
      },
    );
  }

  /**
   * Cria uma regra de validação para URL
   *
   * @returns Regra de validação de URL
   */
  static createURLRule(): ValidationRule {
    return new ValidationRule(
      {
        name: "url-validation",
        description: "Validates URL format",
        category: "format",
        severity: "error",
        priority: 1,
        enabled: true,
      },
      (context) => {
        try {
          new URL(String(context.data));
          return { passed: true };
        } catch {
          return {
            passed: false,
            message: "Invalid URL format",
            field: context.field,
            code: "INVALID_URL_FORMAT",
            suggestion: "Please provide a valid URL",
          };
        }
      },
    );
  }
}
