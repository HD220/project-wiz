/**
 * Utilitários de transformação para campos de formulário
 */

export const fieldTransformers = {
  /**
   * Converte texto para formato slug (kebab-case) adequado para nomes de canal
   */
  channelName: (value: string): string => {
    return value.toLowerCase().replace(/\s+/g, "-");
  },

  /**
   * Remove espaços extras e normaliza texto
   */
  normalizeText: (value: string): string => {
    return value.trim().replace(/\s+/g, " ");
  },

  /**
   * Converte para uppercase
   */
  uppercase: (value: string): string => {
    return value.toUpperCase();
  },

  /**
   * Converte para lowercase
   */
  lowercase: (value: string): string => {
    return value.toLowerCase();
  },

  /**
   * Remove caracteres especiais, mantendo apenas letras, números e hífens
   */
  alphanumericHyphen: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9-]/g, "");
  },
} as const;
