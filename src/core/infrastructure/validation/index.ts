import { CustomValidator, ValidationError } from '../../../shared/types/validation';
import { z, ZodType } from 'zod';

/**
 * Validador base abstrato
 */
export abstract class BaseValidator<T> implements CustomValidator<T> {
  private readonly _schema: ZodType<T>;

  constructor(schema: ZodType<T>) {
    this._schema = schema;
  }

  validate(data: unknown): T {
    const result = this._schema.safeParse(data);
    if (!result.success) {
      throw this.formatError(result.error);
    }
    return result.data;
  }

  get schema(): ZodType<T> {
    return this._schema;
  }

  protected abstract formatError(error: z.ZodError): ValidationError;
}

/**
 * Validador para dados de entrada
 */
export class InputValidator<T> extends BaseValidator<T> {
  protected formatError(error: z.ZodError): ValidationError {
    return {
      code: 'INVALID_INPUT',
      message: 'Dados de entrada inválidos',
      path: error.errors[0].path
    };
  }
}

/**
 * Validador para processamento interno
 */
export class ProcessingValidator<T> extends BaseValidator<T> {
  protected formatError(error: z.ZodError): ValidationError {
    return {
      code: 'INVALID_PROCESSING',
      message: 'Erro durante processamento interno',
      path: error.errors[0].path
    };
  }
}

/**
 * Validador para dados de saída
 */
export class OutputValidator<T> extends BaseValidator<T> {
  protected formatError(error: z.ZodError): ValidationError {
    return {
      code: 'INVALID_OUTPUT',
      message: 'Dados de saída inválidos',
      path: error.errors[0].path
    };
  }
}

/**
 * Fábrica de validadores
 */
export class ValidatorFactory {
  static createInputValidator<T>(schema: ZodType<T>): InputValidator<T> {
    return new InputValidator(schema);
  }

  static createProcessingValidator<T>(schema: ZodType<T>): ProcessingValidator<T> {
    return new ProcessingValidator(schema);
  }

  static createOutputValidator<T>(schema: ZodType<T>): OutputValidator<T> {
    return new OutputValidator(schema);
  }
}