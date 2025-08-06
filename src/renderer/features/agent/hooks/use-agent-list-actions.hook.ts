import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import type { SelectAgent, AgentStatus } from "@/main/features/agent/agent.types";

export function useAgentListActions() {
  const deleteAgentMutation = useApiMutation(
    (agentId: string) => window.api.agents.delete(agentId),
    {
      successMessage: "Agent deleted successfully",
      errorMessage: "Failed to delete agent",
      invalidateRouter: true,
    },
  );

  const restoreAgentMutation = useApiMutation(
    (agentId: string) => window.api.agents.restore(agentId),
    {
      successMessage: "Agent restored successfully",
      errorMessage: "Failed to restore agent",
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

  const handleDelete = (agent: SelectAgent) => {
    deleteAgentMutation.mutate(agent.id);
  };

  const handleRestore = (agent: SelectAgent) => {
    restoreAgentMutation.mutate(agent.id);
  };

  const handleToggleStatus = (agent: SelectAgent) => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    toggleAgentStatusMutation.mutate({ agentId: agent.id, status: newStatus });
  };

  return {
    handleDelete,
    handleRestore,
    handleToggleStatus,
    isDeleting: deleteAgentMutation.isPending,
    isRestoring: restoreAgentMutation.isPending,
    isTogglingStatus: toggleAgentStatusMutation.isPending,
  };
}
