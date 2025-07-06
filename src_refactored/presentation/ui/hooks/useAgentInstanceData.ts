import { useParams } from "@tanstack/react-router";

import type { AgentInstance } from "@/core/domain/entities/agent";
import { AgentLLM } from "@/core/domain/entities/llm";
import type { LLMConfig } from "@/core/domain/entities/llm";
import type { PersonaTemplate } from "@/core/domain/entities/persona";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type { GetAgentInstanceDetailsRequest } from "@/shared/ipc-types/agent.types";

import { useIpcQuery } from "./ipc/useIpcQuery";

export function useAgentInstanceData() {
  const params = useParams({ from: "/app/agents/$agentId/edit/" });
  const agentId = params.agentId;

  const {
    data: agentInstance,
    isLoading: isLoadingAgent,
    error: agentError,
    refetch: refetchAgent,
  } = useIpcQuery<
    AgentInstance | null,
    GetAgentInstanceDetailsRequest
  >(
    IPC_CHANNELS.GET_AGENT_INSTANCE_DETAILS,
    { agentId: agentId },
    { staleTime: 5 * 60 * 1000 }
  );

  const {
    data: personaTemplates,
    isLoading: isLoadingPersonas,
    error: personasError,
  } = useIpcQuery<PersonaTemplate[]>(
    IPC_CHANNELS.GET_PERSONA_TEMPLATES_LIST,
    undefined,
    { staleTime: 15 * 60 * 1000 }
  );

  const {
    data: llmConfigs,
    isLoading: isLoadingLLMs,
    error: llmsError,
  } = useIpcQuery<Record<AgentLLM, LLMConfig>>(
    IPC_CHANNELS.GET_LLM_CONFIGS_LIST,
    undefined,
    { staleTime: 15 * 60 * 1000 }
  );

  const isLoadingAll = isLoadingAgent || isLoadingPersonas || isLoadingLLMs;
  const anyError = agentError || personasError || llmsError;

  return {
    agentId,
    agentInstance,
    personaTemplates,
    llmConfigs,
    isLoadingAll,
    anyError,
    agentError,
    personasError,
    llmsError,
    refetchAgent,
  };
}

