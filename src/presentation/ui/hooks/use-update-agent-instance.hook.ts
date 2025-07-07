import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { useIpcMutation } from "@/ui/hooks/ipc/use-ipc-mutation.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type {
  UpdateAgentInstanceRequest,
  UpdateAgentInstanceResponse,
} from "@/shared/ipc-types/agent.types";

import type { AgentInstanceFormData } from "@/ui/features/agent/components/agent-instance-form";

interface UseUpdateAgentInstanceProps {
  agentId: string;
  refetchAgent: () => void;
}

export function useUpdateAgentInstance({
  agentId,
  refetchAgent,
}: UseUpdateAgentInstanceProps) {
  const router = useRouter();

  const updateAgentMutation = useIpcMutation<
    UpdateAgentInstanceResponse,
    UpdateAgentInstanceRequest
  >(IPC_CHANNELS.UPDATE_AGENT_INSTANCE, {
    onSuccess: (data) => {
      const agentDisplayName =
        data.agentName || `Agente (ID: ${data.id.substring(0, 6)})`;
      toast.success(
        `Instância de Agente "${agentDisplayName}" atualizada com sucesso!`
      );
      refetchAgent();
      router.navigate({
        to: "/app/agents/$agentId",
        params: { agentId: data.id },
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar a instância: ${error.message}`);
    },
  });

  const handleSubmit = async (
    formData: AgentInstanceFormData
  ): Promise<void> => {
    updateAgentMutation.mutate({ agentId, data: formData });
  };

  return { handleSubmit, isSubmitting: updateAgentMutation.isPending };
}
