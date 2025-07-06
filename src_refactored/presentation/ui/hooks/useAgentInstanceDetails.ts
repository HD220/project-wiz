import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetAgentInstanceDetailsRequest,
  GetAgentInstanceDetailsResponse,
} from "@/shared/ipc-types/agent.types";
import type { AgentInstance } from "@/core/domain/entities/agent";

export function useAgentInstanceDetails() {
  const params = useParams({ from: "/app/agents/$agentId/" });
  const agentId = params.agentId;

  const {
    data: instance,
    isLoading,
    error,
  } = useIpcQuery<
    AgentInstance | null,
    GetAgentInstanceDetailsRequest
  >(
    IPC_CHANNELS.GET_AGENT_INSTANCE_DETAILS,
    { agentId }
  );

  return { agentId, instance, isLoading, error };
}
