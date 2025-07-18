/**
 * Utilitários consolidados para formatação de data/tempo no frontend
 */
export const DateUtils = {
  /**
   * Calcula dias até uma data específica
   */
  getDaysUntilDue: (dueDate?: Date): number | null => {
    if (!dueDate) return null;
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  },

  /**
   * Formata data da última mensagem de forma amigável
   */
  formatLastMessageTime: (date?: Date): string => {
    if (!date) return "";

    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return messageDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (days === 1) {
      return "Ontem";
    }

    if (days < 7) {
      return `${days}d atrás`;
    }

    return messageDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  },

  /**
   * Formata data para exibição geral
   */
  formatForDisplay: (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  /**
   * Formata data/hora para exibição completa
   */
  formatDateTime: (date: Date): string => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Verifica se uma data é hoje
   */
  isToday: (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  /**
   * Verifica se uma data é ontem
   */
  isYesterday: (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  },

  /**
   * Formata data relativa (Ex: "2 horas atrás", "3 dias atrás")
   */
  formatRelative: (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days === 1 ? "1 dia atrás" : `${days} dias atrás`;
    }

    if (hours > 0) {
      return hours === 1 ? "1 hora atrás" : `${hours} horas atrás`;
    }

    if (minutes > 0) {
      return minutes === 1 ? "1 minuto atrás" : `${minutes} minutos atrás`;
    }

    return "Agora mesmo";
  },

  /**
   * Converte string para Date com segurança
   */
  safeParse: (dateString: string): Date | null => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  },

  /**
   * Formata período de tempo (Ex: "2h 30m", "1d 4h")
   */
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }

    if (minutes > 0) {
      return `${minutes}m`;
    }

    return `${seconds}s`;
  },
} as const;
