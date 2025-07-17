/**
 * Utilitários específicos para domínios de negócio
 */

import type { Task } from "@/lib/mock-data/types";
import type { Agent } from "@/lib/placeholders";

/**
 * Utilitários para domínio de Agentes
 */
export const AgentUtils = {
  /**
   * Gera iniciais do nome do agente
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
   * Verifica se o agente está ativo
   */
  isActive: (status: Agent["status"]): boolean => {
    return ["online", "executing", "busy"].includes(status);
  },

  /**
   * Verifica se o agente está disponível para novas tarefas
   */
  isAvailable: (status: Agent["status"]): boolean => {
    return status === "online";
  },

  /**
   * Formata descrição do agente
   */
  formatDescription: (description: string, maxLength = 100): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "...";
  },
} as const;

/**
 * Utilitários para domínio de Projetos
 */
export const ProjectUtils = {
  /**
   * Gera slug do projeto
   */
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  },

  /**
   * Valida nome do projeto
   */
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  /**
   * Calcula progresso do projeto baseado em tarefas
   */
  calculateProgress: (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed",
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  },

  /**
   * Retorna cor baseada no status do projeto
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  },
} as const;

/**
 * Utilitários para domínio de Usuários
 */
export const UserUtils = {
  /**
   * Gera iniciais do usuário
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
   * Formata nome de usuário
   */
  formatDisplayName: (name: string): string => {
    return name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  },

  /**
   * Verifica se o usuário está online
   */
  isOnline: (lastSeen: Date): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  },

  /**
   * Gera avatar placeholder
   */
  generateAvatarPlaceholder: (name: string): string => {
    const initials = UserUtils.getInitials(name);
    const hue =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="hsl(${hue}, 70%, 50%)"/><text x="20" y="25" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${initials}</text></svg>`;
  },
} as const;

/**
 * Utilitários para domínio de LLM
 */
export const LLMUtils = {
  /**
   * Formata configuração de temperatura
   */
  formatTemperature: (temperature: number): string => {
    return temperature.toFixed(1);
  },

  /**
   * Valida configuração de temperatura
   */
  isValidTemperature: (temperature: number): boolean => {
    return temperature >= 0 && temperature <= 2;
  },

  /**
   * Formata max tokens
   */
  formatMaxTokens: (maxTokens: number): string => {
    return maxTokens.toLocaleString();
  },

  /**
   * Valida max tokens
   */
  isValidMaxTokens: (maxTokens: number): boolean => {
    return maxTokens > 0 && maxTokens <= 4096;
  },

  /**
   * Gera configuração padrão
   */
  getDefaultConfig: () => ({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  }),

  /**
   * Formata tipo de provider
   */
  formatProviderType: (type: string): string => {
    switch (type) {
      case "openai":
        return "OpenAI";
      case "deepseek":
        return "DeepSeek";
      case "anthropic":
        return "Anthropic";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  },
} as const;

/**
 * Utilitários para domínio de Tarefas
 */
export const TaskUtils = {
  /**
   * Retorna cor baseada na prioridade
   */
  getPriorityColor: (priority: Task["priority"]): string => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  },

  /**
   * Retorna texto da prioridade
   */
  getPriorityText: (priority: Task["priority"]): string => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "Não definida";
    }
  },

  /**
   * Calcula tempo restante para conclusão
   */
  getTimeRemaining: (dueDate: Date): string => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "Atrasado";
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    return `${days} dias`;
  },

  /**
   * Verifica se a tarefa está atrasada
   */
  isOverdue: (dueDate: Date): boolean => {
    return dueDate < new Date();
  },

  /**
   * Verifica se a tarefa vence hoje
   */
  isDueToday: (dueDate: Date): boolean => {
    const today = new Date();
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  },
} as const;
