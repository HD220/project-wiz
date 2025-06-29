import { AgentInstance, AgentLLM } from '../../../../shared/types/entities';

export const mockAgentInstances: AgentInstance[] = [
  {
    id: 'agent-1',
    name: 'DevHelper Bot',
    personaTemplateId: 'pt-1', // Corresponds to Software Developer Assistant
    projectId: 'proj-1', // Belongs to Project Wiz
    llmConfig: {
      llm: AgentLLM.OPENAI_GPT_4_TURBO,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      topK: 50,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
    },
    tools: ['code_interpreter', 'web_search'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'agent-2',
    name: 'StoryBot',
    personaTemplateId: 'pt-2', // Corresponds to Creative Writer
    projectId: 'proj-2', // Belongs to Project Alpha
    llmConfig: {
      llm: AgentLLM.ANTHROPIC_CLAUDE_3_OPUS,
      temperature: 0.8,
      maxTokens: 4000,
      topP: 0.9,
      topK: 40,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
      stopSequences: ['\nHuman:'],
    },
    tools: ['image_generation', 'document_analysis'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'agent-3',
    name: 'CodeReviewer',
    personaTemplateId: 'pt-1',
    projectId: 'proj-1', // Also in Project Wiz
    llmConfig: {
      llm: AgentLLM.GOOGLE_GEMINI_PRO,
      temperature: 0.5,
      maxTokens: 3000,
      topP: 1.0,
      topK: 50,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [],
    },
    tools: ['code_interpreter'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
