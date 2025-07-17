import type { Agent } from "@/shared/interfaces/agent.interface";
import { StatusUtils } from "@/lib/status-utils";

export function useAgentStatusUtils() {
  const getStatusColor = (status: Agent["status"]) => {
    return StatusUtils.getAgentStatusColor(status);
  };

  const getStatusText = (status: Agent["status"]) => {
    return StatusUtils.getAgentStatusText(status);
  };

  const getStatusInfo = (status: Agent["status"]) => {
    return StatusUtils.getAgentStatusInfo(status);
  };

  return {
    getStatusColor,
    getStatusText,
    getStatusInfo,
  };
}
