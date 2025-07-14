/**
 * @fileoverview Validation Service
 *
 * Serviço centralizado de validação usando Zod schemas com suporte
 * a validação síncrona e assíncrona, composição de schemas e cache.
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
 * Resultado de validação tipado
 */
export interface ValidationResult<T = unknown> {
  /** Indica se a validação foi bem-sucedida */
  readonly success: boolean;
  /** Dados validados (se sucesso) */
  readonly data?: T;
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
 * Opções de validação
 */
export interface ValidationOptions {
  /** Contexto da validação */
  readonly context?: string;
  /** Modo de validação estrito */
  readonly strict?: boolean;
  /** Transformar dados após validação */
  readonly transform?: boolean;
  /** Usar cache de validação */
  readonly useCache?: boolean;
  /** Timeout para validação assíncrona */
  readonly timeout?: number;
}

/**
 * Configuração do cache de validação
 */
export interface ValidationCacheConfig {
  /** Tamanho máximo do cache */
  readonly maxSize: number;
  /** TTL do cache em milissegundos */
  readonly ttl: number;
  /** Habilitar cache */
  readonly enabled: boolean;
}

/**
 * Entrada do cache de validação
 */
interface ValidationCacheEntry {
  /** Resultado da validação */
  readonly result: ValidationResult;
  /** Timestamp de criação */
  readonly createdAt: Date;
  /** Timestamp de expiração */
  readonly expiresAt: Date;
}

/**
 * Validador customizado
 */
export interface CustomValidator<T = unknown> {
  /** Nome do validador */
  readonly name: string;
  /** Descrição do validador */
  readonly description: string;
  /** Schema Zod */
  readonly schema: z.ZodSchema<T>;
  /** Função de validação customizada */
  readonly validate?: (data: T) => Promise<ValidationResult<T>>;
}

/**
 * Estatísticas de validação
 */
export interface ValidationStats {
  /** Total de validações */
  readonly totalValidations: number;
  /** Validações bem-sucedidas */
  readonly successfulValidations: number;
  /** Validações com erro */
  readonly failedValidations: number;
  /** Tempo médio de validação */
  readonly averageExecutionTime: number;
  /** Taxa de sucesso */
  readonly successRate: number;
  /** Acertos do cache */
  readonly cacheHits: number;
  /** Erros do cache */
  readonly cacheMisses: number;
  /** Taxa de acerto do cache */
  readonly cacheHitRate: number;
}

/**
 * Serviço centralizado de validação
 *
 * Responsável por validar dados usando Zod schemas com suporte
 * a cache, transformações e validações customizadas.
 */
export class ValidationService {
  private readonly logger: Logger;
  private readonly cache: Map<string, ValidationCacheEntry> = new Map();
  private readonly customValidators: Map<string, CustomValidator> = new Map();
  private readonly stats: ValidationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    averageExecutionTime: 0,
    successRate: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: 0,
  };

  /**
   * Configuração padrão do cache
   */
  private static readonly DEFAULT_CACHE_CONFIG: ValidationCacheConfig = {
    maxSize: 1000,
    ttl: 300000, // 5 minutos
    enabled: true,
  };

  /**
   * Configuração do cache
   */
  private readonly cacheConfig: ValidationCacheConfig;

  /**
   * Cria uma nova instância do ValidationService
   *
   * @param cacheConfig - Configuração do cache
   */
  constructor(cacheConfig: Partial<ValidationCacheConfig> = {}) {
    this.cacheConfig = {
      ...ValidationService.DEFAULT_CACHE_CONFIG,
      ...cacheConfig,
    };

    const loggerFactory = new LoggerFactory({
      defaultLevel: LogLevel.INFO,
      globalContext: { module: "ValidationService" },
    });
    this.logger = loggerFactory.createLogger("ValidationService");
    this.logger.info("ValidationService initialized", {
      cacheConfig: this.cacheConfig,
    });
  }

  /**
   * Valida dados usando um schema Zod
   *
   * @param schema - Schema Zod para validação
   * @param data - Dados a serem validados
   * @param options - Opções de validação
   * @returns Resultado da validação
   */
  async validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: ValidationOptions = {},
  ): Promise<ValidationResult<T>> {
    const startTime = Date.now();
    const context = options.context || "validation";
    const cacheKey = this.generateCacheKey(schema, data, options);

    try {
      // Verificar cache se habilitado
      if (options.useCache !== false && this.cacheConfig.enabled) {
        const cachedResult = this.getCachedResult<T>(cacheKey);
        if (cachedResult) {
          this.updateStats(true, Date.now() - startTime, true);
          return cachedResult;
        }
      }

      this.logger.debug("Starting validation", {
        context,
        strict: options.strict,
        transform: options.transform,
      });

      // Validar usando Zod
      const zodResult = options.transform
        ? schema.safeParse(data)
        : schema.safeParse(data);

      const errors: ValidationError[] = [];
      const warnings: string[] = [];

      if (!zodResult.success) {
        // Processar erros do Zod
        for (const error of zodResult.error.errors) {
          errors.push(
            ValidationError.invalidFormat(
              error.path.join(".") || "root",
              String(error.code),
              error.message,
            ),
          );
        }
      }

      const success = errors.length === 0;
      const executionTime = Date.now() - startTime;

      const result: ValidationResult<T> = {
        success,
        data: success ? zodResult.data : undefined,
        errors,
        warnings,
        validatedAt: new Date(),
        context,
        executionTime,
      };

      // Armazenar no cache se habilitado
      if (options.useCache !== false && this.cacheConfig.enabled && success) {
        this.setCachedResult(cacheKey, result);
      }

      this.updateStats(success, executionTime, false);

      this.logger.debug("Validation completed", {
        context,
        success,
        errorCount: errors.length,
        warningCount: warnings.length,
        executionTime,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, false);

      this.logger.error("Validation failed", {
        context,
        error,
        executionTime,
      });

      return {
        success: false,
        errors: [
          ValidationError.invalidFormat(
            "validation",
            "validation_failed",
            error instanceof Error ? error.message : "Validation failed",
          ),
        ],
        warnings: [],
        validatedAt: new Date(),
        context,
        executionTime,
      };
    }
  }

  /**
   * Valida dados de forma síncrona
   *
   * @param schema - Schema Zod para validação
   * @param data - Dados a serem validados
   * @param options - Opções de validação
   * @returns Resultado da validação
   */
  validateSync<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: ValidationOptions = {},
  ): ValidationResult<T> {
    const startTime = Date.now();
    const context = options.context || "sync_validation";

    try {
      const zodResult = schema.safeParse(data);
      const errors: ValidationError[] = [];
      const warnings: string[] = [];

      if (!zodResult.success) {
        for (const error of zodResult.error.errors) {
          errors.push(
            ValidationError.invalidFormat(
              error.path.join(".") || "root",
              String(error.code),
              error.message,
            ),
          );
        }
      }

      const success = errors.length === 0;
      const executionTime = Date.now() - startTime;

      const result: ValidationResult<T> = {
        success,
        data: success ? zodResult.data : undefined,
        errors,
        warnings,
        validatedAt: new Date(),
        context,
        executionTime,
      };

      this.updateStats(success, executionTime, false);
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, false);

      return {
        success: false,
        errors: [
          InternalError.configuration(
            "ValidationService",
            "sync_validation_failed",
            error instanceof Error
              ? error
              : new Error("Sync validation failed"),
          ),
        ],
        warnings: [],
        validatedAt: new Date(),
        context,
        executionTime,
      };
    }
  }

  /**
   * Valida usando validador customizado
   *
   * @param validatorName - Nome do validador customizado
   * @param data - Dados a serem validados
   * @param options - Opções de validação
   * @returns Resultado da validação
   */
  async validateWithCustomValidator<T>(
    validatorName: string,
    data: unknown,
    options: ValidationOptions = {},
  ): Promise<ValidationResult<T>> {
    const validator = this.customValidators.get(validatorName);
    if (!validator) {
      throw ValidationError.invalidFormat(
        "validator",
        validatorName,
        "Custom validator not found",
      );
    }

    // Validar primeiro com o schema Zod
    const schemaResult = await this.validate(validator.schema, data, options);
    if (!schemaResult.success) {
      return schemaResult as ValidationResult<T>;
    }

    // Aplicar validação customizada se existe
    if (validator.validate) {
      return validator.validate(schemaResult.data!);
    }

    return schemaResult as ValidationResult<T>;
  }

  /**
   * Compõe múltiplos schemas para validação
   *
   * @param schemas - Schemas a serem compostos
   * @param data - Dados a serem validados
   * @param options - Opções de validação
   * @returns Resultado da validação
   */
  async validateComposed<T>(
    schemas: z.ZodSchema<any>[],
    data: unknown,
    options: ValidationOptions = {},
  ): Promise<ValidationResult<T>> {
    const startTime = Date.now();
    const context = options.context || "composed_validation";

    try {
      const allErrors: ValidationError[] = [];
      const allWarnings: string[] = [];
      let validData = data;

      // Validar com cada schema sequencialmente
      for (let i = 0; i < schemas.length; i++) {
        const schema = schemas[i];
        const result = await this.validate(schema, validData, {
          ...options,
          context: `${context}_step_${i + 1}`,
        });

        if (!result.success) {
          allErrors.push(...result.errors);
        }

        allWarnings.push(...result.warnings);

        if (result.data) {
          validData = result.data;
        }
      }

      const success = allErrors.length === 0;
      const executionTime = Date.now() - startTime;

      const result: ValidationResult<T> = {
        success,
        data: success ? (validData as T) : undefined,
        errors: allErrors,
        warnings: allWarnings,
        validatedAt: new Date(),
        context,
        executionTime,
      };

      this.updateStats(success, executionTime, false);
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, false);

      return {
        success: false,
        errors: [
          InternalError.configuration(
            "ValidationService",
            "composed_validation_failed",
            error instanceof Error
              ? error
              : new Error("Composed validation failed"),
          ),
        ],
        warnings: [],
        validatedAt: new Date(),
        context,
        executionTime,
      };
    }
  }

  /**
   * Adiciona um validador customizado
   *
   * @param validator - Validador customizado
   */
  addCustomValidator<T>(validator: CustomValidator<T>): void {
    this.customValidators.set(validator.name, validator);
    this.logger.debug("Custom validator added", {
      name: validator.name,
      description: validator.description,
    });
  }

  /**
   * Remove um validador customizado
   *
   * @param name - Nome do validador
   */
  removeCustomValidator(name: string): void {
    this.customValidators.delete(name);
    this.logger.debug("Custom validator removed", { name });
  }

  /**
   * Limpa o cache de validação
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug("Validation cache cleared");
  }

  /**
   * Obtém estatísticas de validação
   *
   * @returns Estatísticas atuais
   */
  getStats(): ValidationStats {
    return { ...this.stats };
  }

  /**
   * Obtém validadores customizados
   *
   * @returns Array com validadores customizados
   */
  getCustomValidators(): CustomValidator[] {
    return Array.from(this.customValidators.values());
  }

  /**
   * Gera chave de cache
   */
  private generateCacheKey(
    schema: z.ZodSchema<any>,
    data: unknown,
    options: ValidationOptions,
  ): string {
    const schemaHash = schema.constructor.name;
    const dataHash = JSON.stringify(data);
    const optionsHash = JSON.stringify(options);

    return `${schemaHash}_${dataHash}_${optionsHash}`;
  }

  /**
   * Obtém resultado do cache
   */
  private getCachedResult<T>(key: string): ValidationResult<T> | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    return entry.result as ValidationResult<T>;
  }

  /**
   * Armazena resultado no cache
   */
  private setCachedResult<T>(key: string, result: ValidationResult<T>): void {
    // Verificar limite do cache
    if (this.cache.size >= this.cacheConfig.maxSize) {
      // Remover entradas mais antigas
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const now = new Date();
    const entry: ValidationCacheEntry = {
      result,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.cacheConfig.ttl),
    };

    this.cache.set(key, entry);
  }

  /**
   * Atualiza estatísticas
   */
  private updateStats(
    success: boolean,
    executionTime: number,
    fromCache: boolean,
  ): void {
    const stats = this.stats as any;

    stats.totalValidations++;

    if (success) {
      stats.successfulValidations++;
    } else {
      stats.failedValidations++;
    }

    if (fromCache) {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
    }

    stats.successRate = stats.successfulValidations / stats.totalValidations;
    stats.cacheHitRate =
      stats.cacheHits / (stats.cacheHits + stats.cacheMisses);

    // Calcular tempo médio
    stats.averageExecutionTime =
      (stats.averageExecutionTime * (stats.totalValidations - 1) +
        executionTime) /
      stats.totalValidations;
  }
}
