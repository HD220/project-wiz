import { ipcMain } from 'electron';

import {
  IPC_CHANNELS
} from '../../../../shared/ipc-channels';
import {
  GetAvailableLLMsResponse,
  GetLLMConfigsListResponse,
  UpdateLLMConfigRequest,
  UpdateLLMConfigResponse
} from '../../../../shared/ipc-types/llm.types';
import { AgentLLM, LLMConfig } from "@/domain/entities/llm";
import {
  mockAvailableLLMs,
  // mockUserLLMConfigs, // Not directly used, access via getLLMConfigWithDefaults or updateUserLLMConfig
  updateUserLLMConfig,
  getLLMConfigWithDefaults
} from '../mocks/llm-config.mocks';

export function registerLLMConfigHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_AVAILABLE_LLMS, async (): Promise<LLMConfig[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockAvailableLLMs;
  });

  ipcMain.handle(IPC_CHANNELS.GET_LLM_CONFIGS_LIST, async (): Promise<Record<AgentLLM, LLMConfig>> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    // Construct full configs with defaults for all available LLMs
    const fullUserConfigs = Object.values(AgentLLM).reduce((acc: Record<AgentLLM, LLMConfig>, llmKey: AgentLLM) => {
      // Ensure llmKey is treated as a key of AgentLLM enum
      const key = llmKey as AgentLLM;
      acc[key] = getLLMConfigWithDefaults(key);
      return acc;
    }, {} as Record<AgentLLM, LLMConfig>); 

    return fullUserConfigs;
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_LLM_CONFIG, async (_event, req: UpdateLLMConfigRequest): Promise<LLMConfig> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const { configId, data } = req;
    updateUserLLMConfig(configId as AgentLLM, data);
    const updatedConfig = getLLMConfigWithDefaults(configId as AgentLLM);
    return updatedConfig;
  });
}
