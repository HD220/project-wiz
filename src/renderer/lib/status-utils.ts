import type { Agent } from "@/lib/placeholders";

/**
 * Utilitários consolidados para formatação de status de agentes
 */
export const StatusUtils = {
  /**
   * Retorna a cor de background baseada no status do agente
   */
  getAgentStatusColor: (status: Agent["status"]): string => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "executing":
        return "bg-blue-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
      default:
        return "bg-gray-400";
    }
  },

  /**
   * Retorna o texto localizado do status do agente
   */
  getAgentStatusText: (status: Agent["status"]): string => {
    switch (status) {
      case "online":
        return "Online";
      case "executing":
        return "Executando";
      case "busy":
        return "Ocupado";
      case "away":
        return "Ausente";
      case "offline":
        return "Offline";
      default:
        return "Desconhecido";
    }
  },

  /**
   * Retorna a cor de texto baseada no status do agente
   */
  getAgentStatusTextColor: (status: Agent["status"]): string => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "executing":
        return "text-blue-600";
      case "busy":
        return "text-red-600";
      case "away":
        return "text-yellow-600";
      case "offline":
      default:
        return "text-gray-600";
    }
  },

  /**
   * Retorna a cor de borda baseada no status do agente
   */
  getAgentStatusBorderColor: (status: Agent["status"]): string => {
    switch (status) {
      case "online":
        return "border-green-500";
      case "executing":
        return "border-blue-500";
      case "busy":
        return "border-red-500";
      case "away":
        return "border-yellow-500";
      case "offline":
      default:
        return "border-gray-400";
    }
  },

  /**
   * Retorna informações completas do status do agente
   */
  getAgentStatusInfo: (status: Agent["status"]) => ({
    color: StatusUtils.getAgentStatusColor(status),
    text: StatusUtils.getAgentStatusText(status),
    textColor: StatusUtils.getAgentStatusTextColor(status),
    borderColor: StatusUtils.getAgentStatusBorderColor(status),
  }),
} as const;
