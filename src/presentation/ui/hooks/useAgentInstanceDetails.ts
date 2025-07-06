import { useParams } from "@tanstack/react-router";

import type { AgentInstance } from "@/core/domain/entities/agent";

import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetAgentInstanceDetailsRequest,
} from "@/shared/ipc-types/agent.types";

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
