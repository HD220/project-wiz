import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { AgentInstanceFormData } from "@/ui/features/agent/components/AgentInstanceForm";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import {
  UpdateAgentInstanceRequest,
  UpdateAgentInstanceResponseData,
  IPCResponse,
} from "@/shared/ipc-types";

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
    IPCResponse<UpdateAgentInstanceResponseData>,
    UpdateAgentInstanceRequest
  >(IPC_CHANNELS.UPDATE_AGENT_INSTANCE, {
    onSuccess: (response): void => {
      if (response.success && response.data) {
        const agentDisplayName =
          response.data.agentName ||
          `Agente (ID: ${response.data.id.substring(0, 6)})`;
        toast.success(
          `Instância de Agente "${agentDisplayName}" atualizada com sucesso!`
        );
        refetchAgent();
        router.navigate({
          to: "/app/agents/$agentId",
          params: { agentId: response.data.id },
          replace: true,
        });
      } else {
        toast.error(
          `Falha ao atualizar a instância: ${response.error?.message || "Erro desconhecido."}`
        );
      }
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar a instância: ${error.message}`);
    },
  });

  const handleSubmit = async (
    formData: AgentInstanceFormData
  ): Promise<void> => {
    console.log("Dados atualizados da instância de agente:", agentId, formData);
    updateAgentMutation.mutate({ agentId, data: formData });
  };

  return { handleSubmit, isSubmitting: updateAgentMutation.isLoading };
}
