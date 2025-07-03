import { AgentInstance, AgentLLM } from "../../../../shared/types/entities";

export const mockAgentInstances: AgentInstance[] = [
  {
    id: "agent-1",
    agentName: "DevHelper Bot",
    personaTemplateId: "pt-1",
    llmProviderConfigId: "llm-openai-gpt4", // Assuming a mock ID for OpenAI GPT-4
    temperature: 0.7,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "agent-2",
    agentName: "StoryBot",
    personaTemplateId: "pt-2",
    llmProviderConfigId: "llm-anthropic-claude3", // Assuming a mock ID for Anthropic Claude 3
    temperature: 0.8,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "agent-3",
    agentName: "CodeReviewer",
    personaTemplateId: "pt-1",
    llmProviderConfigId: "llm-google-gemini-pro", // Assuming a mock ID for Google Gemini Pro
    temperature: 0.5,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function addMockAgentInstance(newInstance: AgentInstance) {
  mockAgentInstances.push(newInstance);
}

export function updateMockAgentInstance(instanceId: string, updates: Partial<AgentInstance>): AgentInstance | undefined {
  const index = mockAgentInstances.findIndex(ai => ai.id === instanceId);
  if (index !== -1) {
    const updated = { ...mockAgentInstances[index], ...updates, updatedAt: new Date().toISOString() };
    mockAgentInstances[index] = updated;
    return updated;
  }
  return undefined;
}