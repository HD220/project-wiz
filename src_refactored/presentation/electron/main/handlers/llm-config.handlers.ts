import { ipcMain } from 'electron';

import {
  IPC_CHANNELS
} from '../../../../shared/ipc-channels';
import {
  GetAvailableLLMsResponseData,
  GetLLMConfigsListResponseData,
  UpdateLLMConfigRequest,
  UpdateLLMConfigResponseData
} from '../../../../shared/ipc-types';
import { AgentLLM, LLMConfig } from '../../../../shared/types/entities';
import {
  mockAvailableLLMs,
  // mockUserLLMConfigs, // Not directly used, access via getLLMConfigWithDefaults or updateUserLLMConfig
  updateUserLLMConfig,
  getLLMConfigWithDefaults
} from '../mocks/llm-config.mocks';

export function registerLLMConfigHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_AVAILABLE_LLMS, async (): Promise<GetAvailableLLMsResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, data: mockAvailableLLMs };
  });

  ipcMain.handle(IPC_CHANNELS.GET_LLM_CONFIGS_LIST, async (): Promise<GetLLMConfigsListResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    // Construct full configs with defaults for all available LLMs
    const fullUserConfigs = Object.values(AgentLLM).reduce((acc: Record<AgentLLM, LLMConfig>, llmKey: AgentLLM) => {
      // Ensure llmKey is treated as a key of AgentLLM enum
      const key = llmKey as AgentLLM;
      acc[key] = getLLMConfigWithDefaults(key);
      return acc;
    }, {} as Record<AgentLLM, LLMConfig>); 

    return { success: true, data: fullUserConfigs };
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_LLM_CONFIG, async (_event, req: UpdateLLMConfigRequest): Promise<UpdateLLMConfigResponseData> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const { configId, data } = req;
    updateUserLLMConfig(configId, data);
    const updatedConfig = getLLMConfigWithDefaults(configId);
    return { success: true, data: updatedConfig };
  });
}
