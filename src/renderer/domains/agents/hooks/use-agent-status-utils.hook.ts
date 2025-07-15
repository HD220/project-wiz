import type { Agent } from '../../../../lib/placeholders';

export function useAgentStatusUtils() {
  const getStatusColor = (status: Agent["status"]) => {
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
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Agent["status"]) => {
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
  };

  return {
    getStatusColor,
    getStatusText,
  };
}