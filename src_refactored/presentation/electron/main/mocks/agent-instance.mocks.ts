import { AgentLLM } from "@/core/domain/entities/llm";

import { AgentInstance } from "@/shared/ipc-types";

import { getLLMConfigWithDefaults } from "./llm-config.mocks";

export const mockAgentInstances: AgentInstance[] = [
  {
    id: "agent-1",
    agentName: "DevHelper Bot",
    personaTemplateId: "pt-1",
    llmProviderConfigId: "llm-openai-gpt4",
    temperature: 0.7,
    status: "idle",
    llmConfig: getLLMConfigWithDefaults(AgentLLM.OPENAI_GPT_4_TURBO),
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-2",
    agentName: "StoryBot",
    personaTemplateId: "pt-2",
    llmProviderConfigId: "llm-anthropic-claude3",
    temperature: 0.8,
    status: "idle",
    llmConfig: getLLMConfigWithDefaults(AgentLLM.ANTHROPIC_CLAUDE_3_OPUS),
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-3",
    agentName: "CodeReviewer",
    personaTemplateId: "pt-1",
    llmProviderConfigId: "llm-google-gemini-pro",
    temperature: 0.5,
    status: "idle",
    llmConfig: getLLMConfigWithDefaults(AgentLLM.GOOGLE_GEMINI_PRO),
    createdAt: new Date().toISOString(),
  },
];

export function addMockAgentInstance(newInstance: AgentInstance) {
  mockAgentInstances.push(newInstance);
}

export function updateMockAgentInstance(instanceId: string, updates: Partial<AgentInstance>): AgentInstance | undefined {
  const index = mockAgentInstances.findIndex(ai => ai.id === instanceId);
  if (index !== -1) {
    const updated = { ...mockAgentInstances[index], ...updates };
    mockAgentInstances[index] = updated;
    return updated;
  }
  return undefined;
}