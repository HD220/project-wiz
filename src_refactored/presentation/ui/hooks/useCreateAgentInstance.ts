import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { AgentInstanceFormData } from "@/ui/features/agent/components/AgentInstanceForm";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  CreateAgentInstanceRequest,
  CreateAgentInstanceResponseData,
  IPCResponse,
} from "@/shared/ipc-types";


export function useCreateAgentInstance() {
  const router = useRouter();

  const createAgentMutation = useIpcMutation<
    IPCResponse<CreateAgentInstanceResponseData>,
    CreateAgentInstanceRequest
  >(IPC_CHANNELS.CREATE_AGENT_INSTANCE, {
    onSuccess: (response): void => {
      if (response.success && response.data) {
        const agentDisplayName =
          response.data.agentName ||
          `Agente (ID: ${response.data.id.substring(0, 6)})`;
        toast.success(
          `Instância de Agente "${agentDisplayName}" criada com sucesso!`
        );
        router.navigate({
          to: "/app/agents/$agentId",
          params: { agentId: response.data.id },
          replace: true,
        });
      } else {
        toast.error(
          `Falha ao criar a instância: ${response.error?.message || "Erro desconhecido."}`
        );
      }
    },
    onError: (error) => {
      toast.error(`Falha ao criar a instância: ${error.message}`);
    },
  });

  const handleSubmit = async (data: AgentInstanceFormData): Promise<void> => {
    console.log("Dados da nova instância de agente:", data);
    createAgentMutation.mutate(data);
  };

  return { handleSubmit, isSubmitting: createAgentMutation.isLoading };
}
