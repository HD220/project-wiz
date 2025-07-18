/**
 * Utilitários para transformação de campos de formulário
 * Seguindo Object Calisthenics: máximo 50 linhas, funções simples
 */

/**
 * Funções auxiliares para eliminar duplicação
 */
const TextCleaner = {
  removeNonAlphanumeric: (value: string, allowed: string): string => {
    const pattern = new RegExp(`[^a-zA-Z0-9${allowed}]`, "g");
    return value.replace(pattern, "");
  },

  normalizeSpaces: (value: string): string => {
    return value.trim().replace(/\s+/g, " ");
  },
};

/**
 * Transformações de texto
 */
export const FieldTransformers = {
  channelName: (value: string): string => {
    return value.toLowerCase().replace(/\s+/g, "-");
  },

  normalizeText: (value: string): string => {
    return TextCleaner.normalizeSpaces(value);
  },

  uppercase: (value: string): string => {
    return value.toUpperCase();
  },

  lowercase: (value: string): string => {
    return value.toLowerCase();
  },

  alphanumericHyphen: (value: string): string => {
    return TextCleaner.removeNonAlphanumeric(value, "-");
  },

  alphanumericUnderscore: (value: string): string => {
    return TextCleaner.removeNonAlphanumeric(value, "_");
  },

  slugify: (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  },

  capitalize: (value: string): string => {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  trim: (value: string): string => {
    return value.trim();
  },

  maxLength:
    (maxLength: number) =>
    (value: string): string => {
      return value.substring(0, maxLength);
    },
} as const;
