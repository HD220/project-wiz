import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { useIpcMutation } from "@/ui/hooks/ipc/use-ipc-mutation.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type {
  CreateAgentInstanceRequest,
  CreateAgentInstanceResponse,
} from "@/shared/ipc-types/agent.types";

import type { AgentInstanceFormData } from "@/ui/features/agent/components/agent-instance-form";

export function useCreateAgentInstance() {
  const router = useRouter();

  const createAgentMutation = useIpcMutation<
    CreateAgentInstanceResponse,
    CreateAgentInstanceRequest
  >(IPC_CHANNELS.CREATE_AGENT_INSTANCE, {
    onSuccess: (data) => {
      const agentDisplayName =
        data.agentName || `Agente (ID: ${data.id.substring(0, 6)})`;
      toast.success(
        `Instância de Agente "${agentDisplayName}" criada com sucesso!`
      );
      router.navigate({
        to: "/app/agents/$agentId",
        params: { agentId: data.id },
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(`Falha ao criar a instância: ${error.message}`);
    },
  });

  const handleSubmit = async (data: AgentInstanceFormData): Promise<void> => {
    createAgentMutation.mutate(data);
  };

  return { handleSubmit, isSubmitting: createAgentMutation.isPending };
}
