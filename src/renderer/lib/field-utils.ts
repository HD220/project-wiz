/**
 * Utilitários consolidados para transformação e validação de campos de formulário
 */
export const FieldUtils = {
  /**
   * Transformações de campo
   */
  transformers: {
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

    /**
     * Remove caracteres especiais, mantendo apenas letras, números e underscores
     */
    alphanumericUnderscore: (value: string): string => {
      return value.replace(/[^a-zA-Z0-9_]/g, "");
    },

    /**
     * Converte para formato slug (kebab-case)
     */
    slugify: (value: string): string => {
      return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    },

    /**
     * Capitaliza primeira letra de cada palavra
     */
    capitalize: (value: string): string => {
      return value.replace(/\b\w/g, (char) => char.toUpperCase());
    },

    /**
     * Remove espaços em branco no início e fim
     */
    trim: (value: string): string => {
      return value.trim();
    },

    /**
     * Limita o número de caracteres
     */
    maxLength:
      (maxLength: number) =>
      (value: string): string => {
        return value.substring(0, maxLength);
      },

    /**
     * Remove números do texto
     */
    removeNumbers: (value: string): string => {
      return value.replace(/\d/g, "");
    },

    /**
     * Remove caracteres especiais
     */
    removeSpecialChars: (value: string): string => {
      return value.replace(/[^a-zA-Z0-9\s]/g, "");
    },
  },

  /**
   * Validações de campo
   */
  validators: {
    /**
     * Verifica se o valor não está vazio
     */
    notEmpty: (value: string): boolean => {
      return value.trim().length > 0;
    },

    /**
     * Verifica se o valor tem comprimento mínimo
     */
    minLength:
      (minLength: number) =>
      (value: string): boolean => {
        return value.length >= minLength;
      },

    /**
     * Verifica se o valor tem comprimento máximo
     */
    maxLength:
      (maxLength: number) =>
      (value: string): boolean => {
        return value.length <= maxLength;
      },

    /**
     * Verifica se é um email válido
     */
    isEmail: (value: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },

    /**
     * Verifica se é uma URL válida
     */
    isUrl: (value: string): boolean => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Verifica se contém apenas letras, números e hífens
     */
    isAlphanumericHyphen: (value: string): boolean => {
      return /^[a-zA-Z0-9-]+$/.test(value);
    },

    /**
     * Verifica se é um identificador válido (letras, números, underscore)
     */
    isValidIdentifier: (value: string): boolean => {
      return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value);
    },

    /**
     * Verifica se é um número válido
     */
    isNumber: (value: string): boolean => {
      return !isNaN(Number(value));
    },

    /**
     * Verifica se é um inteiro válido
     */
    isInteger: (value: string): boolean => {
      return Number.isInteger(Number(value));
    },

    /**
     * Verifica se está dentro de um range numérico
     */
    inRange:
      (min: number, max: number) =>
      (value: string): boolean => {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
      },
  },

  /**
   * Formatadores de campo
   */
  formatters: {
    /**
     * Formata CPF
     */
    cpf: (value: string): string => {
      const cleanValue = value.replace(/\D/g, "");
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    },

    /**
     * Formata CNPJ
     */
    cnpj: (value: string): string => {
      const cleanValue = value.replace(/\D/g, "");
      return cleanValue.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    },

    /**
     * Formata telefone
     */
    phone: (value: string): string => {
      const cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length === 11) {
        return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      }
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    },

    /**
     * Formata CEP
     */
    cep: (value: string): string => {
      const cleanValue = value.replace(/\D/g, "");
      return cleanValue.replace(/(\d{5})(\d{3})/, "$1-$2");
    },

    /**
     * Formata valor monetário
     */
    currency: (value: string): string => {
      const cleanValue = value.replace(/\D/g, "");
      const numericValue = parseFloat(cleanValue) / 100;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(numericValue);
    },
  },
} as const;

// Legacy exports for backward compatibility
export const fieldTransformers = FieldUtils.transformers;
