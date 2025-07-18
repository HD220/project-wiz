/**
 * Utilitários consolidados para UI - Ponto central para todos os utils de interface
 */

// Core utilities
export { cn } from "./utils";

// Specialized utilities
export { StatusUtils } from "./status-utils";
export { DateUtils } from "./date-utils";
export { FieldUtils } from "./field-utils";

// Legacy exports for backward compatibility
export { getAgentStatusColor } from "./utils";
export { fieldTransformers } from "./field-utils";

/**
 * Utilitários adicionais para UI
 */
export const UIUtils = {
  /**
   * Clamp um valor entre min e max
   */
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Debounce uma função
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Throttle uma função
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): ((...args: Parameters<T>) => void) => {
    let isThrottled = false;
    return (...args: Parameters<T>) => {
      if (!isThrottled) {
        func(...args);
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, delay);
      }
    };
  },

  /**
   * Converte bytes para formato legível
   */
  formatBytes: (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  /**
   * Gera cor baseada em string (para avatares, etc.)
   */
  stringToColor: (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  },

  /**
   * Trunca texto com reticências
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  },

  /**
   * Verifica se um elemento está visível na viewport
   */
  isElementVisible: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Copia texto para a área de transferência
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Failed to copy text:", error);
      return false;
    }
  },

  /**
   * Scroll suave para um elemento
   */
  scrollToElement: (
    element: HTMLElement,
    behavior: ScrollBehavior = "smooth",
  ): void => {
    element.scrollIntoView({ behavior, block: "center" });
  },

  /**
   * Formata número com separadores de milhares
   */
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat("pt-BR").format(num);
  },

  /**
   * Formata porcentagem
   */
  formatPercentage: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Gera ID único simples
   */
  generateId: (): string => {
    return Math.random().toString(36).substring(2, 15);
  },

  /**
   * Verifica se é um dispositivo móvel
   */
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  },

  /**
   * Verifica se é um dispositivo touch
   */
  isTouchDevice: (): boolean => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Obtém contraste de cor baseado no background
   */
  getContrastColor: (backgroundColor: string): string => {
    // Converte hex para RGB
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calcula luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  },
} as const;
