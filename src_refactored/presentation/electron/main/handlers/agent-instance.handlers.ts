import { ipcMain } from 'electron';
import {
  GET_AGENT_INSTANCES_CHANNEL,
  GET_AGENT_INSTANCE_DETAILS_CHANNEL,
  CREATE_AGENT_INSTANCE_CHANNEL,
  UPDATE_AGENT_INSTANCE_CHANNEL,
  GET_AGENT_INSTANCES_BY_PROJECT_CHANNEL,
} from '../../../../shared/ipc-channels';
import { mockAgentInstances } from '../mocks/agent-instance.mocks';
import { AgentInstance } from '../../../../shared/types/entities';
import {
  GetAgentInstancesResponse,
  GetAgentInstanceDetailsRequest,
  GetAgentInstanceDetailsResponse,
  CreateAgentInstanceRequest,
  CreateAgentInstanceResponse,
  UpdateAgentInstanceRequest,
  UpdateAgentInstanceResponse,
  GetAgentInstancesByProjectRequest,
  GetAgentInstancesByProjectResponse,
} from '../../../../shared/ipc-types/agent-instance';
import { AgentLLM } from '../../../../shared/types/entities'; // Import AgentLLM

export function registerAgentInstanceHandlers() {
  ipcMain.handle(GET_AGENT_INSTANCES_CHANNEL, async (): Promise<GetAgentInstancesResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { agentInstances: mockAgentInstances };
  });

  ipcMain.handle(GET_AGENT_INSTANCES_BY_PROJECT_CHANNEL, async (_event, req: GetAgentInstancesByProjectRequest): Promise<GetAgentInstancesByProjectResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const instances = mockAgentInstances.filter(ai => ai.projectId === req.projectId);
    return { agentInstances: instances };
  });

  ipcMain.handle(GET_AGENT_INSTANCE_DETAILS_CHANNEL, async (_event, req: GetAgentInstanceDetailsRequest): Promise<GetAgentInstanceDetailsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const instance = mockAgentInstances.find(ai => ai.id === req.instanceId);
    if (instance) {
      return { agentInstance: instance };
    } else {
      return { agentInstance: undefined, error: 'Agent Instance not found' };
    }
  });

  ipcMain.handle(CREATE_AGENT_INSTANCE_CHANNEL, async (_event, req: CreateAgentInstanceRequest): Promise<CreateAgentInstanceResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const newInstance: AgentInstance = {
      id: `agent-${Date.now()}`,
      name: req.name,
      personaTemplateId: req.personaTemplateId,
      projectId: req.projectId,
      llmConfig: req.llmConfig || {
        llm: AgentLLM.OPENAI_GPT_4_TURBO, // Default
        temperature: 0.7,
        maxTokens: 2048,
      },
      tools: req.tools || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAgentInstances.push(newInstance);
    return { agentInstance: newInstance };
  });

  ipcMain.handle(UPDATE_AGENT_INSTANCE_CHANNEL, async (_event, req: UpdateAgentInstanceRequest): Promise<UpdateAgentInstanceResponse> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const instanceIndex = mockAgentInstances.findIndex(ai => ai.id === req.instanceId);
    if (instanceIndex !== -1) {
      // Create a new object for the updated instance to avoid direct mutation issues if mocks are shared.
      const currentInstance = mockAgentInstances[instanceIndex];
      const updatedInstance = {
        ...currentInstance,
        ...req.updates,
        // Ensure nested objects like llmConfig are merged properly if partial updates are allowed
        ...(req.updates.llmConfig && currentInstance.llmConfig
            ? { llmConfig: { ...currentInstance.llmConfig, ...req.updates.llmConfig } }
            : currentInstance.llmConfig // Retain original if no update for llmConfig
        ),
        updatedAt: new Date().toISOString()
      };
      mockAgentInstances[instanceIndex] = updatedInstance;
      return { agentInstance: updatedInstance };
    } else {
      return { agentInstance: undefined, error: 'Agent Instance not found for update' };
    }
  });
}
