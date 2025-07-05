import { ipcMain } from "electron";

import {
  IPC_CHANNELS
} from "../../../../shared/ipc-channels";
import {
  
  GetAgentInstanceDetailsRequest,
  GetAgentInstanceDetailsResponseData,
  CreateAgentInstanceRequest,
  CreateAgentInstanceResponseData,
  UpdateAgentInstanceRequest,
  UpdateAgentInstanceResponseData,
  GetAgentInstancesListRequest,
  GetAgentInstancesByProjectRequest,
  IPCResponse
} from "../../../../shared/ipc-types";
import { AgentInstance, AgentLLM } from "../../../../shared/types/entities";
import { mockAgentInstances } from "../mocks/agent-instance.mocks";

function registerQueryAgentInstanceHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.GET_AGENT_INSTANCES_LIST,
    async (): Promise<IPCResponse<AgentInstance[]>> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { success: true, data: mockAgentInstances };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GET_AGENT_INSTANCES_BY_PROJECT,
    async (
      _event,
      req: GetAgentInstancesByProjectRequest
    ): Promise<IPCResponse<AgentInstance[]>> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const instances = mockAgentInstances.filter(
        (ai) => ai.projectId === req.projectId
      );
      return { success: true, data: instances };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GET_AGENT_INSTANCE_DETAILS,
    async (
      _event,
      req: GetAgentInstanceDetailsRequest
    ): Promise<GetAgentInstanceDetailsResponseData> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const instance = mockAgentInstances.find(
        (ai) => ai.id === req.agentId
      );
      if (instance) {
        return { success: true, data: instance };
      }
      return { success: false, error: { message: "Agent instance not found" } };
    }
  );
}

function registerCreateAgentInstanceHandler() {
  ipcMain.handle(
    IPC_CHANNELS.CREATE_AGENT_INSTANCE,
    async (
      _event,
      req: CreateAgentInstanceRequest
    ): Promise<IPCResponse<AgentInstance>> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const newInstance: AgentInstance = {
        id: `agent-${Date.now()}`,
        personaTemplateId: req.personaTemplateId,
        agentName: req.agentName,
        llmProviderConfigId: req.llmProviderConfigId,
        temperature: req.temperature,
        projectId: req.projectId,
        llmConfig: req.llmConfig || {
          id: `llm-config-${Date.now()}`,
          name: "Default OpenAI GPT-4 Turbo",
          providerId: "openai",
          llm: AgentLLM.OPENAI_GPT_4_TURBO,
          temperature: 0.7,
          maxTokens: 2048,
        },
        tools: req.tools || [],
        createdAt: new Date().toISOString(),
        status: "idle",
      };
      mockAgentInstances.push(newInstance);
      return { success: true, data: newInstance };
    }
  );
}

function registerUpdateAgentInstanceHandler() {
  ipcMain.handle(
    IPC_CHANNELS.UPDATE_AGENT_INSTANCE,
    async (
      _event,
      req: UpdateAgentInstanceRequest
    ): Promise<IPCResponse<AgentInstance>> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const instanceIndex = mockAgentInstances.findIndex(
        (ai) => ai.id === req.agentId
      );
      if (instanceIndex !== -1) {
        const currentInstance = mockAgentInstances[instanceIndex];
        const updatedInstance = {
          ...currentInstance,
          ...req.data,
          ...(req.data.llmConfig && currentInstance.llmConfig
            ? {
                llmConfig: {
                  ...currentInstance.llmConfig,
                  ...req.data.llmConfig,
                },
              }
            : currentInstance.llmConfig),
          updatedAt: new Date().toISOString(),
        };
        mockAgentInstances[instanceIndex] = updatedInstance;
        return { success: true, data: updatedInstance };
      }
      return { success: false, error: { message: "Agent instance not found" } };
    }
  );
}

export function registerAgentInstanceHandlers() {
  registerQueryAgentInstanceHandlers();
  registerCreateAgentInstanceHandler();
  registerUpdateAgentInstanceHandler();
}
