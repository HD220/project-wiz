import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetAgentInstanceDetailsRequest,
  GetAgentInstanceDetailsResponseData,
} from "@/shared/ipc-types";

export function useAgentInstanceDetails() {
  const params = useParams({ from: "/app/agents/$agentId/" });
  const agentId = params.agentId;

  const {
    data: instance,
    isLoading,
    error,
  } = useIpcQuery<
    GetAgentInstanceDetailsRequest,
    GetAgentInstanceDetailsResponseData
  >(
    IPC_CHANNELS.GET_AGENT_INSTANCE_DETAILS,
    { agentId },
    {
      onError: (err) => {
        toast.error(`Erro ao buscar detalhes do agente: ${err.message}`);
      },
    }
  );

  return { agentId, instance, isLoading, error };
}
