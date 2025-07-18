/**
 * Utilitários compartilhados entre domínios
 */

/**
 * Utilitários comuns para strings
 */
export const StringUtils = {
  /**
   * Gera iniciais de um nome
   */
  getInitials: (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Formata nome para display (primeira letra maiúscula)
   */
  formatDisplayName: (name: string): string => {
    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  },

  /**
   * Gera slug (kebab-case)
   */
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  },

  /**
   * Trunca texto com elipses
   */
  truncate: (text: string, maxLength = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  },

  /**
   * Normaliza texto (remove espaços extras)
   */
  normalize: (text: string): string => {
    return text.trim().replace(/\s+/g, " ");
  },
} as const;

/**
 * Utilitários para validação
 */
export const ValidationUtils = {
  /**
   * Valida se o nome tem tamanho adequado
   */
  isValidName: (name: string, minLength = 2, maxLength = 100): boolean => {
    const trimmed = name.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  /**
   * Valida temperatura LLM
   */
  isValidTemperature: (temperature: number): boolean => {
    return temperature >= 0 && temperature <= 2;
  },

  /**
   * Valida max tokens
   */
  isValidMaxTokens: (maxTokens: number): boolean => {
    return maxTokens > 0 && maxTokens <= 4096;
  },
} as const;

/**
 * Utilitários para formatação
 */
export const FormatUtils = {
  /**
   * Formata número com separador de milhares
   */
  formatNumber: (num: number): string => {
    return num.toLocaleString();
  },

  /**
   * Formata decimal com casas específicas
   */
  formatDecimal: (num: number, decimals = 1): string => {
    return num.toFixed(decimals);
  },

  /**
   * Gera avatar placeholder SVG
   */
  generateAvatarPlaceholder: (name: string): string => {
    const initials = StringUtils.getInitials(name);
    const hue =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="hsl(${hue}, 70%, 50%)"/><text x="20" y="25" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${initials}</text></svg>`;
  },
} as const;

/**
 * Utilitários para cores/status
 */
export const ColorUtils = {
  /**
   * Retorna cor baseada no status
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case "active":
      case "online":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
      case "busy":
        return "bg-yellow-500";
      case "archived":
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  },
} as const;
