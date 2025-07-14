/**
 * @fileoverview Schema Validator
 *
 * Validador baseado em Zod schemas com suporte a composição,
 * transformação e validação hierárquica.
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
import { ValidationResult, ValidationResultUtils } from "./validation-result";
import { ValidationRule, ValidationRuleContext } from "./validation-rule";

/**
 * Configuração do schema validator
 */
export interface SchemaValidatorConfig {
  /** Nome do validador */
  readonly name: string;
  /** Versão do schema */
  readonly version: string;
  /** Modo estrito */
  readonly strict: boolean;
  /** Aplicar transformações */
  readonly applyTransforms: boolean;
  /** Validar campos desconhecidos */
  readonly allowUnknownFields: boolean;
  /** Regras customizadas */
  readonly customRules: ValidationRule[];
  /** Timeout para validação */
  readonly timeout?: number;
}

/**
 * Informações sobre o schema
 */
export interface SchemaInfo {
  /** Nome do schema */
  readonly name: string;
  /** Versão do schema */
  readonly version: string;
  /** Tipo de dados esperado */
  readonly expectedType: string;
  /** Campos obrigatórios */
  readonly requiredFields: string[];
  /** Campos opcionais */
  readonly optionalFields: string[];
  /** Campos aninhados */
  readonly nestedFields: Record<string, SchemaInfo>;
}

/**
 * Contexto de validação do schema
 */
export interface SchemaValidationContext {
  /** Schema sendo usado */
  readonly schema: z.ZodSchema<any>;
  /** Dados sendo validados */
  readonly data: unknown;
  /** Caminho atual no objeto */
  readonly path: string[];
  /** Profundidade atual */
  readonly depth: number;
  /** Configuração do validador */
  readonly config: SchemaValidatorConfig;
  /** Metadados adicionais */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Resultado detalhado de validação de schema
 */
export interface SchemaValidationResult<T = unknown>
  extends ValidationResult<T> {
  /** Informações sobre o schema */
  readonly schemaInfo: SchemaInfo;
  /** Campos validados */
  readonly validatedFields: string[];
  /** Campos ignorados */
  readonly ignoredFields: string[];
  /** Transformações aplicadas */
  readonly transformations: Record<string, any>;
  /** Regras aplicadas */
  readonly appliedRules: string[];
  /** Caminhos com erro */
  readonly errorPaths: string[];
}

/**
 * Estatísticas do schema validator
 */
export interface SchemaValidatorStats {
  /** Total de validações */
  readonly totalValidations: number;
  /** Validações bem-sucedidas */
  readonly successfulValidations: number;
  /** Validações com erro */
  readonly failedValidations: number;
  /** Tempo médio de validação */
  readonly averageValidationTime: number;
  /** Schemas mais usados */
  readonly mostUsedSchemas: Record<string, number>;
  /** Erros mais comuns */
  readonly commonErrors: Record<string, number>;
}

/**
 * Validador de schema baseado em Zod
 *
 * Fornece validação robusta usando Zod schemas com suporte
 * a composição, transformação e regras customizadas.
 */
export class SchemaValidator {
  private readonly logger: Logger;
  private readonly registeredSchemas: Map<string, z.ZodSchema<any>> = new Map();
  private readonly schemaInfos: Map<string, SchemaInfo> = new Map();
  private readonly stats: SchemaValidatorStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    averageValidationTime: 0,
    mostUsedSchemas: {},
    commonErrors: {},
  } as any;

  /**
   * Configuração padrão
   */
  private static readonly DEFAULT_CONFIG: SchemaValidatorConfig = {
    name: "default",
    version: "1.0.0",
    strict: true,
    applyTransforms: true,
    allowUnknownFields: false,
    customRules: [],
  };

  /**
   * Cria uma nova instância do SchemaValidator
   *
   * @param config - Configuração do validador
   */
  constructor(
    private readonly config: SchemaValidatorConfig = SchemaValidator.DEFAULT_CONFIG,
  ) {
    const loggerFactory = new LoggerFactory({
      defaultLevel: LogLevel.INFO,
      globalContext: { module: `SchemaValidator:${config.name}` },
    });
    this.logger = loggerFactory.createLogger(`SchemaValidator:${config.name}`);
    this.logger.info("SchemaValidator initialized", {
      name: config.name,
      version: config.version,
      strict: config.strict,
    });
  }

  /**
   * Registra um schema para reutilização
   *
   * @param name - Nome do schema
   * @param schema - Schema Zod
   * @param info - Informações sobre o schema
   */
  registerSchema<T>(
    name: string,
    schema: z.ZodSchema<T>,
    info?: Partial<SchemaInfo>,
  ): void {
    this.registeredSchemas.set(name, schema);

    const schemaInfo: SchemaInfo = {
      name,
      version: info?.version || "1.0.0",
      expectedType: this.getSchemaType(schema),
      requiredFields: this.extractRequiredFields(schema),
      optionalFields: this.extractOptionalFields(schema),
      nestedFields: this.extractNestedFields(schema),
      ...info,
    };

    this.schemaInfos.set(name, schemaInfo);

    this.logger.debug("Schema registered", {
      name,
      expectedType: schemaInfo.expectedType,
      requiredFields: schemaInfo.requiredFields.length,
      optionalFields: schemaInfo.optionalFields.length,
    });
  }

  /**
   * Valida dados usando um schema específico
   *
   * @param schemaName - Nome do schema registrado
   * @param data - Dados a serem validados
   * @param context - Contexto adicional
   * @returns Resultado da validação
   */
  async validateWithSchema<T>(
    schemaName: string,
    data: unknown,
    context?: string,
  ): Promise<SchemaValidationResult<T>> {
    const schema = this.registeredSchemas.get(schemaName);
    if (!schema) {
      throw ValidationError.invalidFormat(
        "schema",
        schemaName,
        "Schema not found",
      );
    }

    const schemaInfo = this.schemaInfos.get(schemaName)!;
    return this.validate(
      schema,
      data,
      { ...this.config, name: schemaName },
      schemaInfo,
      context,
    );
  }

  /**
   * Valida dados usando um schema Zod diretamente
   *
   * @param schema - Schema Zod
   * @param data - Dados a serem validados
   * @param config - Configuração específica
   * @param schemaInfo - Informações sobre o schema
   * @param context - Contexto adicional
   * @returns Resultado da validação
   */
  async validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    config: SchemaValidatorConfig = this.config,
    schemaInfo?: SchemaInfo,
    context?: string,
  ): Promise<SchemaValidationResult<T>> {
    const startTime = Date.now();
    const validationContext: SchemaValidationContext = {
      schema,
      data,
      path: [],
      depth: 0,
      config,
    };

    try {
      this.logger.debug("Starting schema validation", {
        schemaName: config.name,
        dataType: typeof data,
        context,
      });

      // Atualizar estatísticas
      this.updateSchemaUsage(config.name);

      // Validar com timeout se configurado
      const result = config.timeout
        ? await this.validateWithTimeout(validationContext, config.timeout)
        : await this.performValidation(validationContext);

      const executionTime = Date.now() - startTime;

      // Construir resultado detalhado
      const detailedResult: SchemaValidationResult<T> = {
        ...result,
        schemaInfo: schemaInfo || this.createSchemaInfo(schema, config.name),
        validatedFields: this.extractValidatedFields(result.data),
        ignoredFields: [],
        transformations: {},
        appliedRules: [],
        errorPaths: this.extractErrorPaths(result.errors),
        executionTime,
        context: context || config.name,
      };

      // Aplicar regras customizadas
      if (config.customRules.length > 0 && result.success) {
        await this.applyCustomRules(detailedResult, config.customRules);
      }

      this.updateStats(detailedResult.success, executionTime);

      this.logger.debug("Schema validation completed", {
        schemaName: config.name,
        success: detailedResult.success,
        errorCount: detailedResult.errors.length,
        warningCount: detailedResult.warnings.length,
        executionTime,
      });

      return detailedResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime);
      this.updateErrorStats(
        error instanceof Error ? error.message : "Unknown error",
      );

      this.logger.error("Schema validation failed", {
        schemaName: config.name,
        error,
        executionTime,
      });

      return {
        success: false,
        errors: [
          ValidationError.invalidFormat(
            "schema_validation",
            "validation_failed",
            error instanceof Error ? error.message : "Schema validation failed",
          ),
        ],
        warnings: [],
        validatedAt: new Date(),
        context: context || config.name,
        executionTime,
        schemaInfo: schemaInfo || this.createSchemaInfo(schema, config.name),
        validatedFields: [],
        ignoredFields: [],
        transformations: {},
        appliedRules: [],
        errorPaths: [],
      };
    }
  }

  /**
   * Valida lote de dados usando o mesmo schema
   *
   * @param schema - Schema Zod
   * @param dataArray - Array de dados
   * @param config - Configuração específica
   * @returns Array de resultados
   */
  async validateBatch<T>(
    schema: z.ZodSchema<T>,
    dataArray: unknown[],
    config: SchemaValidatorConfig = this.config,
  ): Promise<SchemaValidationResult<T>[]> {
    const results: SchemaValidationResult<T>[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i];
      const result = await this.validate(
        schema,
        data,
        config,
        undefined,
        `batch_${i}`,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Compõe múltiplos schemas para validação sequencial
   *
   * @param schemas - Schemas a serem aplicados
   * @param data - Dados a serem validados
   * @param config - Configuração específica
   * @returns Resultado da validação composta
   */
  async validateComposed<T>(
    schemas: z.ZodSchema<any>[],
    data: unknown,
    config: SchemaValidatorConfig = this.config,
  ): Promise<SchemaValidationResult<T>> {
    let currentData = data;
    let allErrors: ValidationError[] = [];
    let allWarnings: string[] = [];
    const appliedRules: string[] = [];
    const transformations: Record<string, any> = {};

    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      const stepConfig = { ...config, name: `${config.name}_step_${i}` };
      const result = await this.validate(schema, currentData, stepConfig);

      if (!result.success) {
        allErrors.push(...result.errors);
        // Parar se estiver em modo estrito
        if (config.strict) {
          break;
        }
      } else {
        currentData = result.data;
        Object.assign(transformations, result.transformations);
      }

      allWarnings.push(...result.warnings);
      appliedRules.push(...result.appliedRules);
    }

    const success = allErrors.length === 0;

    return {
      success,
      data: success ? (currentData as T) : undefined,
      errors: allErrors,
      warnings: allWarnings,
      validatedAt: new Date(),
      context: `${config.name}_composed`,
      executionTime: 0, // Seria calculado somando os tempos individuais
      schemaInfo: this.createSchemaInfo(schemas[0], config.name),
      validatedFields: success ? this.extractValidatedFields(currentData) : [],
      ignoredFields: [],
      transformations,
      appliedRules,
      errorPaths: this.extractErrorPaths(allErrors),
    };
  }

  /**
   * Obtém informações sobre um schema registrado
   *
   * @param name - Nome do schema
   * @returns Informações do schema
   */
  getSchemaInfo(name: string): SchemaInfo | undefined {
    return this.schemaInfos.get(name);
  }

  /**
   * Lista todos os schemas registrados
   *
   * @returns Array com nomes dos schemas
   */
  listRegisteredSchemas(): string[] {
    return Array.from(this.registeredSchemas.keys());
  }

  /**
   * Obtém estatísticas do validador
   *
   * @returns Estatísticas atuais
   */
  getStats(): SchemaValidatorStats {
    return { ...this.stats };
  }

  /**
   * Limpa todos os schemas registrados
   */
  clearSchemas(): void {
    this.registeredSchemas.clear();
    this.schemaInfos.clear();
    this.logger.debug("All schemas cleared");
  }

  /**
   * Realiza a validação principal
   */
  private async performValidation<T>(
    context: SchemaValidationContext,
  ): Promise<ValidationResult<T>> {
    const { schema, data, config } = context;

    try {
      // Configurar schema baseado nas opções
      let finalSchema = schema;

      if (!config.allowUnknownFields && this.isObjectSchema(schema)) {
        finalSchema = (schema as any).strict();
      }

      // Executar validação
      const result = config.applyTransforms
        ? finalSchema.safeParse(data)
        : finalSchema.safeParse(data);

      if (!result.success) {
        const errors = result.error.errors.map((error) =>
          ValidationError.invalidFormat(
            error.path.join(".") || "root",
            String(error.code),
            error.message,
          ),
        );

        return {
          success: false,
          errors,
          warnings: [],
          validatedAt: new Date(),
          context: config.name,
          executionTime: 0,
        };
      }

      return {
        success: true,
        data: result.data,
        errors: [],
        warnings: [],
        validatedAt: new Date(),
        context: config.name,
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          InternalError.configuration(
            "SchemaValidator",
            "validation_execution_failed",
            error instanceof Error
              ? error
              : new Error("Validation execution failed"),
          ),
        ],
        warnings: [],
        validatedAt: new Date(),
        context: config.name,
        executionTime: 0,
      };
    }
  }

  /**
   * Valida com timeout
   */
  private async validateWithTimeout<T>(
    context: SchemaValidationContext,
    timeout: number,
  ): Promise<ValidationResult<T>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Schema validation timeout after ${timeout}ms`));
      }, timeout);

      this.performValidation(context)
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
   * Aplica regras customizadas
   */
  private async applyCustomRules<T>(
    result: SchemaValidationResult<T>,
    rules: ValidationRule[],
  ): Promise<void> {
    for (const rule of rules) {
      if (rule.canExecute({ data: result.data, timestamp: new Date() })) {
        const ruleResult = await rule.execute({
          data: result.data,
          timestamp: new Date(),
        });

        if (!ruleResult.passed) {
          (result.errors as ValidationError[]).push(
            ValidationError.invalidFormat(
              ruleResult.field || "custom_rule",
              result.data,
              ruleResult.message || "Custom rule failed",
            ),
          );
        }

        result.appliedRules.push(rule.getConfig().name);
      }
    }
  }

  /**
   * Extrai campos validados
   */
  private extractValidatedFields(data: unknown): string[] {
    if (typeof data !== "object" || data === null) {
      return [];
    }

    return Object.keys(data as Record<string, unknown>);
  }

  /**
   * Extrai caminhos com erro
   */
  private extractErrorPaths(errors: ValidationError[]): string[] {
    return errors.map((error) => error.fields[0]?.field || "root");
  }

  /**
   * Cria informações do schema
   */
  private createSchemaInfo(schema: z.ZodSchema<any>, name: string): SchemaInfo {
    return {
      name,
      version: "1.0.0",
      expectedType: this.getSchemaType(schema),
      requiredFields: this.extractRequiredFields(schema),
      optionalFields: this.extractOptionalFields(schema),
      nestedFields: {},
    };
  }

  /**
   * Obtém tipo do schema
   */
  private getSchemaType(schema: z.ZodSchema<any>): string {
    return schema.constructor.name.replace("Zod", "").toLowerCase();
  }

  /**
   * Extrai campos obrigatórios
   */
  private extractRequiredFields(schema: z.ZodSchema<any>): string[] {
    // Implementação simplificada - seria mais complexa na prática
    return [];
  }

  /**
   * Extrai campos opcionais
   */
  private extractOptionalFields(schema: z.ZodSchema<any>): string[] {
    // Implementação simplificada - seria mais complexa na prática
    return [];
  }

  /**
   * Extrai campos aninhados
   */
  private extractNestedFields(
    schema: z.ZodSchema<any>,
  ): Record<string, SchemaInfo> {
    // Implementação simplificada - seria mais complexa na prática
    return {};
  }

  /**
   * Verifica se é schema de objeto
   */
  private isObjectSchema(schema: z.ZodSchema<any>): boolean {
    return schema instanceof z.ZodObject;
  }

  /**
   * Atualiza uso do schema
   */
  private updateSchemaUsage(schemaName: string): void {
    const stats = this.stats as any;
    stats.mostUsedSchemas[schemaName] =
      (stats.mostUsedSchemas[schemaName] || 0) + 1;
  }

  /**
   * Atualiza estatísticas
   */
  private updateStats(success: boolean, executionTime: number): void {
    const stats = this.stats as any;

    stats.totalValidations++;

    if (success) {
      stats.successfulValidations++;
    } else {
      stats.failedValidations++;
    }

    stats.averageValidationTime =
      (stats.averageValidationTime * (stats.totalValidations - 1) +
        executionTime) /
      stats.totalValidations;
  }

  /**
   * Atualiza estatísticas de erro
   */
  private updateErrorStats(errorMessage: string): void {
    const stats = this.stats as any;
    stats.commonErrors[errorMessage] =
      (stats.commonErrors[errorMessage] || 0) + 1;
  }
}
