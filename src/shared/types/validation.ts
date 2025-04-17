import { z } from 'zod';

/**
 * Contratos de validação para a camada de infraestrutura
 * Implementa Design by Contract para interfaces críticas
 */

// Validação básica para strings
export const StringValidation = z.string().min(1).max(255);

// Validação para IDs
export const IdValidation = z.string().uuid();

// Validação para emails
export const EmailValidation = z.string().email();

// Validação para datas ISO
export const DateValidation = z.string().datetime();

// Validação para URLs
export const UrlValidation = z.string().url();

// Validação para números positivos
export const PositiveNumberValidation = z.number().positive();

// Interface para validadores customizados
export interface CustomValidator<T> {
  validate(data: unknown): T;
  get schema(): z.ZodType<T>;
}

// Tipo para erros de validação
export type ValidationError = {
  code: string;
  message: string;
  path?: (string | number)[];
};