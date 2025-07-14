/**
 * @fileoverview Validation Result Types
 *
 * Tipos e interfaces centralizadas para resultados de validação
 * com suporte a diferentes tipos de validação e composição.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ValidationError } from "../errors/validation-error";

/**
 * Resultado de validação básico
 */
export interface BaseValidationResult {
  /** Indica se a validação foi bem-sucedida */
  readonly success: boolean;
  /** Erros de validação */
  readonly errors: ValidationError[];
  /** Avisos de validação */
  readonly warnings: string[];
  /** Timestamp da validação */
  readonly validatedAt: Date;
  /** Contexto da validação */
  readonly context: string;
  /** Tempo de execução da validação */
  readonly executionTime: number;
}

/**
 * Resultado de validação tipado
 */
export interface ValidationResult<T = unknown> extends BaseValidationResult {
  /** Dados validados (se sucesso) */
  readonly data?: T;
}

/**
 * Resultado de validação de campo
 */
export interface FieldValidationResult extends BaseValidationResult {
  /** Nome do campo validado */
  readonly fieldName: string;
  /** Valor original do campo */
  readonly originalValue: unknown;
  /** Valor validado do campo */
  readonly validatedValue?: unknown;
  /** Tipo esperado do campo */
  readonly expectedType?: string;
}

/**
 * Resultado de validação de schema
 */
export interface SchemaValidationResult<T = unknown>
  extends ValidationResult<T> {
  /** Nome do schema usado */
  readonly schemaName: string;
  /** Versão do schema */
  readonly schemaVersion?: string;
  /** Campos validados */
  readonly validatedFields: string[];
  /** Campos ignorados */
  readonly ignoredFields?: string[];
  /** Transformações aplicadas */
  readonly transformations?: Record<string, unknown>;
}

/**
 * Resultado de validação composta
 */
export interface ComposedValidationResult<T = unknown>
  extends ValidationResult<T> {
  /** Resultados individuais de cada etapa */
  readonly stepResults: ValidationResult[];
  /** Número total de etapas */
  readonly totalSteps: number;
  /** Etapa atual (se ainda em execução) */
  readonly currentStep?: number;
  /** Indica se foi interrompida */
  readonly interrupted: boolean;
}

/**
 * Resultado de validação assíncrona
 */
export interface AsyncValidationResult<T = unknown>
  extends ValidationResult<T> {
  /** Indica se a validação está em progresso */
  readonly inProgress: boolean;
  /** Progresso atual (0-100) */
  readonly progress: number;
  /** Tempo estimado restante */
  readonly estimatedTimeRemaining?: number;
  /** Pode ser cancelada */
  readonly cancellable: boolean;
}

/**
 * Resultado de validação de lote
 */
export interface BatchValidationResult<T = unknown>
  extends BaseValidationResult {
  /** Resultados individuais */
  readonly results: ValidationResult<T>[];
  /** Número total de itens */
  readonly totalItems: number;
  /** Número de itens validados com sucesso */
  readonly successfulItems: number;
  /** Número de itens com erro */
  readonly failedItems: number;
  /** Taxa de sucesso */
  readonly successRate: number;
}

/**
 * Resultado de validação condicional
 */
export interface ConditionalValidationResult<T = unknown>
  extends ValidationResult<T> {
  /** Condições verificadas */
  readonly conditions: Record<string, boolean>;
  /** Regras aplicadas */
  readonly appliedRules: string[];
  /** Regras ignoradas */
  readonly ignoredRules: string[];
  /** Motivo da aplicação/ignorar de regras */
  readonly ruleApplicationReason?: Record<string, string>;
}

/**
 * Resultado de validação de performance
 */
export interface PerformanceValidationResult extends BaseValidationResult {
  /** Tempo detalhado por etapa */
  readonly stepTimings: Record<string, number>;
  /** Uso de memória */
  readonly memoryUsage?: number;
  /** Operações por segundo */
  readonly operationsPerSecond?: number;
  /** Gargalos identificados */
  readonly bottlenecks?: string[];
}

/**
 * Resultado de validação de regra customizada
 */
export interface CustomRuleValidationResult extends BaseValidationResult {
  /** Nome da regra */
  readonly ruleName: string;
  /** Categoria da regra */
  readonly ruleCategory: string;
  /** Severidade da regra */
  readonly ruleSeverity: "error" | "warning" | "info";
  /** Detalhes específicos da regra */
  readonly ruleDetails?: Record<string, unknown>;
  /** Sugestões para correção */
  readonly suggestions?: string[];
}

/**
 * Resumo de validação
 */
export interface ValidationSummary {
  /** Número total de validações */
  readonly totalValidations: number;
  /** Validações bem-sucedidas */
  readonly successfulValidations: number;
  /** Validações com erro */
  readonly failedValidations: number;
  /** Validações com aviso */
  readonly warningValidations: number;
  /** Taxa de sucesso */
  readonly successRate: number;
  /** Tempo total de validação */
  readonly totalExecutionTime: number;
  /** Tempo médio por validação */
  readonly averageExecutionTime: number;
  /** Tipos de erro mais comuns */
  readonly commonErrorTypes: Record<string, number>;
  /** Campos com mais erros */
  readonly mostProblematicFields: Record<string, number>;
}

/**
 * Configuração de validação
 */
export interface ValidationConfig {
  /** Modo estrito */
  readonly strict: boolean;
  /** Parar no primeiro erro */
  readonly stopOnFirstError: boolean;
  /** Incluir avisos */
  readonly includeWarnings: boolean;
  /** Timeout para validação */
  readonly timeout?: number;
  /** Máximo de erros a reportar */
  readonly maxErrors?: number;
  /** Campos a validar */
  readonly fieldsToValidate?: string[];
  /** Campos a ignorar */
  readonly fieldsToIgnore?: string[];
}

/**
 * Métricas de validação
 */
export interface ValidationMetrics {
  /** Timestamp da coleta */
  readonly collectedAt: Date;
  /** Número de validações por tipo */
  readonly validationsByType: Record<string, number>;
  /** Tempo médio por tipo */
  readonly averageTimeByType: Record<string, number>;
  /** Erros por categoria */
  readonly errorsByCategory: Record<string, number>;
  /** Uso de cache */
  readonly cacheUsage: {
    readonly hits: number;
    readonly misses: number;
    readonly hitRate: number;
  };
}

/**
 * Utilitários para resultados de validação
 */
export class ValidationResultUtils {
  /**
   * Combina múltiplos resultados de validação
   *
   * @param results - Resultados a serem combinados
   * @returns Resultado combinado
   */
  static combine<T>(results: ValidationResult<T>[]): ValidationResult<T[]> {
    if (results.length === 0) {
      return {
        success: true,
        data: [],
        errors: [],
        warnings: [],
        validatedAt: new Date(),
        context: "combined",
        executionTime: 0,
      };
    }

    const allErrors = results.flatMap((r) => r.errors);
    const allWarnings = results.flatMap((r) => r.warnings);
    const allData = results
      .filter((r) => r.success && r.data)
      .map((r) => r.data!);
    const totalExecutionTime = results.reduce(
      (sum, r) => sum + r.executionTime,
      0,
    );

    return {
      success: allErrors.length === 0,
      data: allErrors.length === 0 ? allData : undefined,
      errors: allErrors,
      warnings: allWarnings,
      validatedAt: new Date(),
      context: "combined",
      executionTime: totalExecutionTime,
    };
  }

  /**
   * Filtra resultados por severidade
   *
   * @param results - Resultados a serem filtrados
   * @param severity - Severidade mínima
   * @returns Resultados filtrados
   */
  static filterBySeverity<T>(
    results: ValidationResult<T>[],
    severity: "error" | "warning" | "info",
  ): ValidationResult<T>[] {
    switch (severity) {
      case "error":
        return results.filter((r) => r.errors.length > 0);
      case "warning":
        return results.filter((r) => r.warnings.length > 0);
      case "info":
        return results;
      default:
        return results;
    }
  }

  /**
   * Agrupa resultados por contexto
   *
   * @param results - Resultados a serem agrupados
   * @returns Resultados agrupados
   */
  static groupByContext<T>(
    results: ValidationResult<T>[],
  ): Record<string, ValidationResult<T>[]> {
    return results.reduce(
      (groups, result) => {
        const context = result.context;
        if (!groups[context]) {
          groups[context] = [];
        }
        groups[context].push(result);
        return groups;
      },
      {} as Record<string, ValidationResult<T>[]>,
    );
  }

  /**
   * Calcula estatísticas de resultados
   *
   * @param results - Resultados para calcular estatísticas
   * @returns Estatísticas
   */
  static calculateStats<T>(results: ValidationResult<T>[]): ValidationSummary {
    const total = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const withWarnings = results.filter((r) => r.warnings.length > 0).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    // Contar tipos de erro
    const errorTypes: Record<string, number> = {};
    results.forEach((r) => {
      r.errors.forEach((error) => {
        const type = error.constructor.name;
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
    });

    return {
      totalValidations: total,
      successfulValidations: successful,
      failedValidations: failed,
      warningValidations: withWarnings,
      successRate: total > 0 ? successful / total : 0,
      totalExecutionTime: totalTime,
      averageExecutionTime: total > 0 ? totalTime / total : 0,
      commonErrorTypes: errorTypes,
      mostProblematicFields: {}, // Seria implementado baseado em análise específica
    };
  }

  /**
   * Converte resultado para formato JSON
   *
   * @param result - Resultado a ser convertido
   * @returns Objeto JSON
   */
  static toJSON<T>(result: ValidationResult<T>): Record<string, unknown> {
    return {
      success: result.success,
      data: result.data,
      errors: result.errors.map((e) => ({
        message: e.message,
        code: e.code,
        field: e.fields[0]?.field || "unknown",
      })),
      warnings: result.warnings,
      validatedAt: result.validatedAt.toISOString(),
      context: result.context,
      executionTime: result.executionTime,
    };
  }

  /**
   * Cria resultado de sucesso
   *
   * @param data - Dados validados
   * @param context - Contexto da validação
   * @returns Resultado de sucesso
   */
  static success<T>(
    data: T,
    context: string = "validation",
  ): ValidationResult<T> {
    return {
      success: true,
      data,
      errors: [],
      warnings: [],
      validatedAt: new Date(),
      context,
      executionTime: 0,
    };
  }

  /**
   * Cria resultado de erro
   *
   * @param errors - Erros de validação
   * @param context - Contexto da validação
   * @returns Resultado de erro
   */
  static error<T>(
    errors: ValidationError[],
    context: string = "validation",
  ): ValidationResult<T> {
    return {
      success: false,
      errors,
      warnings: [],
      validatedAt: new Date(),
      context,
      executionTime: 0,
    };
  }

  /**
   * Cria resultado com avisos
   *
   * @param data - Dados validados
   * @param warnings - Avisos de validação
   * @param context - Contexto da validação
   * @returns Resultado com avisos
   */
  static withWarnings<T>(
    data: T,
    warnings: string[],
    context: string = "validation",
  ): ValidationResult<T> {
    return {
      success: true,
      data,
      errors: [],
      warnings,
      validatedAt: new Date(),
      context,
      executionTime: 0,
    };
  }
}
