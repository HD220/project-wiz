/**
 * Utilitários consolidados para transformação e validação de campos de formulário
 * Refatorado seguindo Object Calisthenics e Clean Code
 */
import { FieldTransformers } from "./field-transformers";
import { FieldValidators } from "./field-validators";
import { FieldFormatters } from "./field-formatters";

/**
 * Funções auxiliares não incluídas na refatoração
 */
const AdditionalTransformers = {
  removeNumbers: (value: string): string => {
    return value.replace(/\d/g, "");
  },

  removeSpecialChars: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9\s]/g, "");
  },
};

/**
 * Interface consolidada mantendo compatibilidade
 */
export const FieldUtils = {
  transformers: {
    ...FieldTransformers,
    ...AdditionalTransformers,
  },
  validators: FieldValidators,
  formatters: FieldFormatters,
} as const;

// Legacy exports for backward compatibility
export const fieldTransformers = FieldUtils.transformers;
