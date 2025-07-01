import { ipcMain } from 'electron';

import {
  GET_AVAILABLE_LLMS_CHANNEL,
  GET_USER_LLM_CONFIGS_CHANNEL,
  UPDATE_USER_LLM_CONFIG_CHANNEL,
} from '../../../../shared/ipc-channels';
import {
  GetAvailableLLMsResponse,
  GetUserLLMConfigsResponse,
  UpdateUserLLMConfigRequest,
  UpdateUserLLMConfigResponse
} from '../../../../shared/ipc-types';
import { AgentLLM, LLMConfig } from '../../../../shared/types/entities';
import {
  mockAvailableLLMs,
  // mockUserLLMConfigs, // Not directly used, access via getLLMConfigWithDefaults or updateUserLLMConfig
  updateUserLLMConfig,
  getLLMConfigWithDefaults
} from '../mocks/llm-config.mocks';

export function registerLLMConfigHandlers() {
  ipcMain.handle(GET_AVAILABLE_LLMS_CHANNEL, async (): Promise<GetAvailableLLMsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { availableLLMs: mockAvailableLLMs };
  });

  ipcMain.handle(GET_USER_LLM_CONFIGS_CHANNEL, async (): Promise<GetUserLLMConfigsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    // Construct full configs with defaults for all available LLMs
    const fullUserConfigs = Object.values(AgentLLM).reduce((acc, llmKey) => {
      // Ensure llmKey is treated as a key of AgentLLM enum
      const key = llmKey as AgentLLM;
      acc[key] = getLLMConfigWithDefaults(key);
      return acc;
    }, {} as Record<AgentLLM, LLMConfig>); 

    return { userLLMConfigs: fullUserConfigs };
  });

  ipcMain.handle(UPDATE_USER_LLM_CONFIG_CHANNEL, async (_event, req: UpdateUserLLMConfigRequest): Promise<UpdateUserLLMConfigResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const { llm, config } = req;
    updateUserLLMConfig(llm, config);
    const updatedConfig = getLLMConfigWithDefaults(llm);
    return { updatedConfig: updatedConfig };
  });
}
