import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetLLMConfigsListResponse,
} from "@/shared/ipc-types/llm.types";
import type {
  GetPersonaTemplatesListResponse,
} from "@/shared/ipc-types/persona.types";

export function useNewAgentInstanceData() {
  const {
    data: personaTemplates,
    isLoading: isLoadingPersonas,
    error: personasError,
  } = useIpcQuery<GetPersonaTemplatesListResponse>(
    IPC_CHANNELS.GET_PERSONA_TEMPLATES_LIST,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  const {
    data: llmConfigs,
    isLoading: isLoadingLLMConfigs,
    error: llmConfigsError,
  } = useIpcQuery<GetLLMConfigsListResponse>(
    IPC_CHANNELS.GET_LLM_CONFIGS_LIST,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  const isLoadingDependencies = isLoadingPersonas || isLoadingLLMConfigs;
  const dependencyError = personasError || llmConfigsError;

  return {
    personaTemplates,
    llmConfigs,
    isLoadingDependencies,
    dependencyError,
    personasError,
    llmConfigsError,
  };
}
