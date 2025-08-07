import type { Agent } from "@/renderer/features/agent/agent.types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

export function useAgentActions() {
  const inactivateAgentMutation = useApiMutation(
    (agentId: string) => window.api.agent.inactivate({ id: agentId }),
    {
      successMessage: "Agent inactivated successfully",
      errorMessage: "Failed to inactivate agent",
      invalidateRouter: true,
    },
  );

  const activateAgentMutation = useApiMutation(
    (agentId: string) => window.api.agent.activate({ id: agentId }),
    {
      successMessage: "Agent activated successfully",
      errorMessage: "Failed to activate agent",
      invalidateRouter: true,
    },
  );

  const handleInactivate = (agent: Agent) => {
    inactivateAgentMutation.mutate(agent.id);
  };

  const handleToggleStatus = (agent: Agent) => {
    if (agent.status === "active") {
      inactivateAgentMutation.mutate(agent.id);
    } else {
      activateAgentMutation.mutate(agent.id);
    }
  };

  return {
    handleInactivate,
    handleToggleStatus,
    isInactivating: inactivateAgentMutation.isPending,
    isActivating: activateAgentMutation.isPending,
    isTogglingStatus:
      inactivateAgentMutation.isPending || activateAgentMutation.isPending,
  };
}
