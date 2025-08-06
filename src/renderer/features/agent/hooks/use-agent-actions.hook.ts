import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import type { AgentWithAvatar, AgentStatus } from "@/renderer/features/agent/agent.types";

export function useAgentActions() {
  const deleteAgentMutation = useApiMutation(
    (agentId: string) => window.api.agents.delete(agentId),
    {
      successMessage: "Agent deleted successfully",
      errorMessage: "Failed to delete agent",
      invalidateRouter: true,
    },
  );

  const toggleAgentStatusMutation = useApiMutation(
    ({ agentId, status }: { agentId: string; status: AgentStatus }) =>
      window.api.agents.updateStatus(agentId, status),
    {
      successMessage: "Agent status updated successfully",
      errorMessage: "Failed to update agent status",
      invalidateRouter: true,
    },
  );

  const handleDelete = (agent: AgentWithAvatar) => {
    deleteAgentMutation.mutate(agent.id);
  };

  const handleToggleStatus = (agent: AgentWithAvatar) => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    toggleAgentStatusMutation.mutate({ agentId: agent.id, status: newStatus });
  };

  return {
    handleDelete,
    handleToggleStatus,
    isDeleting: deleteAgentMutation.isPending,
    isTogglingStatus: toggleAgentStatusMutation.isPending,
  };
}
