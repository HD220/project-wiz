/**
 * Utilitários para formatação de campos específicos
 * Seguindo Object Calisthenics: máximo 50 linhas, funções simples
 */

/**
 * Função auxiliar para limpeza de números
 */
const NumberCleaner = {
  clean: (value: string): string => {
    return value.replace(/\D/g, "");
  },
};

/**
 * Formatadores de campo
 */
export const FieldFormatters = {
  cpf: (value: string): string => {
    const cleanValue = NumberCleaner.clean(value);
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  cnpj: (value: string): string => {
    const cleanValue = NumberCleaner.clean(value);
    return cleanValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  },

  phone: (value: string): string => {
    const cleanValue = NumberCleaner.clean(value);
    if (cleanValue.length === 11) {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  },

  cep: (value: string): string => {
    const cleanValue = NumberCleaner.clean(value);
    return cleanValue.replace(/(\d{5})(\d{3})/, "$1-$2");
  },

  currency: (value: string): string => {
    const cleanValue = NumberCleaner.clean(value);
    const numericValue = parseFloat(cleanValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
  },
} as const;
