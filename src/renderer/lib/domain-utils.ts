/**
 * Utilitários específicos para domínios de negócio
 */

import type { Task } from "@/lib/mock-data/types";
import type { Agent } from "@/lib/placeholders";

import {
  StringUtils,
  ColorUtils,
  FormatUtils,
  ValidationUtils,
} from "./shared-utils";

/**
 * Utilitários para domínio de Agentes
 */
export const AgentUtils = {
  /**
   * Gera iniciais do nome do agente
   */
  getInitials: StringUtils.getInitials,

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
  formatDescription: StringUtils.truncate,
} as const;

/**
 * Utilitários para domínio de Projetos
 */
export const ProjectUtils = {
  /**
   * Gera slug do projeto
   */
  generateSlug: StringUtils.generateSlug,

  /**
   * Valida nome do projeto
   */
  isValidName: (name: string): boolean => {
    return (
      StringUtils.normalize(name).length >= 2 &&
      StringUtils.normalize(name).length <= 100
    );
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
  getStatusColor: ColorUtils.getStatusColor,
} as const;

/**
 * Utilitários para domínio de Usuários
 */
export const UserUtils = {
  /**
   * Gera iniciais do usuário
   */
  getInitials: StringUtils.getInitials,

  /**
   * Formata nome de usuário
   */
  formatDisplayName: StringUtils.formatDisplayName,

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
    return FormatUtils.generateAvatarPlaceholder(name);
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
    return FormatUtils.formatDecimal(temperature, 1);
  },

  /**
   * Valida configuração de temperatura
   */
  isValidTemperature: ValidationUtils.isValidTemperature,

  /**
   * Formata max tokens
   */
  formatMaxTokens: FormatUtils.formatNumber,

  /**
   * Valida max tokens
   */
  isValidMaxTokens: ValidationUtils.isValidMaxTokens,

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
