/**
 * Utilitários para validação de campos de formulário
 * Seguindo Object Calisthenics: máximo 50 linhas, funções simples
 */

/**
 * Validações de campo
 */
export const FieldValidators = {
  notEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength:
    (minLength: number) =>
    (value: string): boolean => {
      return value.length >= minLength;
    },

  maxLength:
    (maxLength: number) =>
    (value: string): boolean => {
      return value.length <= maxLength;
    },

  isEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  isUrl: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  isAlphanumericHyphen: (value: string): boolean => {
    return /^[a-zA-Z0-9-]+$/.test(value);
  },

  isValidIdentifier: (value: string): boolean => {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value);
  },

  isNumber: (value: string): boolean => {
    return !isNaN(Number(value));
  },

  isInteger: (value: string): boolean => {
    return Number.isInteger(Number(value));
  },

  inRange:
    (min: number, max: number) =>
    (value: string): boolean => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
} as const;
