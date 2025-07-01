import {
  LLMConfig,
  AgentLLM,
  LLMSettings,
} from "../../../../shared/types/entities";

// This could represent globally available LLM models or presets
export const mockAvailableLLMs: LLMSettings[] = [
  {
    id: "llm-openai-gpt-4-turbo",
    name: "OpenAI GPT-4 Turbo",
    provider: "OpenAI",
    model: AgentLLM.OPENAI_GPT_4_TURBO,
    description: "OpenAI's most advanced model, great for complex tasks.",
    apiKeyRequired: true,
    apiUrl: "https://api.openai.com/v1/chat/completions",
  },
  {
    id: "llm-openai-gpt-3.5-turbo",
    name: "OpenAI GPT-3.5 Turbo",
    provider: "OpenAI",
    model: AgentLLM.OPENAI_GPT_3_5_TURBO,
    description: "A fast and cost-effective model from OpenAI.",
    apiKeyRequired: true,
    apiUrl: "https://api.openai.com/v1/chat/completions",
  },
  {
    id: "llm-anthropic-claude-3-opus",
    name: "Anthropic Claude 3 Opus",
    provider: "Anthropic",
    model: AgentLLM.ANTHROPIC_CLAUDE_3_OPUS,
    description: "Anthropic's most powerful model, for highly complex tasks.",
    apiKeyRequired: true,
    apiUrl: "https://api.anthropic.com/v1/messages",
  },
  {
    id: "llm-anthropic-claude-3-sonnet",
    name: "Anthropic Claude 3 Sonnet",
    provider: "Anthropic",
    model: AgentLLM.ANTHROPIC_CLAUDE_3_SONNET,
    description: "A balanced model for performance and speed by Anthropic.",
    apiKeyRequired: true,
    apiUrl: "https://api.anthropic.com/v1/messages",
  },
  {
    id: "llm-google-gemini-pro",
    name: "Google Gemini Pro",
    provider: "Google",
    model: AgentLLM.GOOGLE_GEMINI_PRO,
    description: "Google's model for scaling across a wide range of tasks.",
    apiKeyRequired: true,
    apiUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  },
  // Add more mock LLMs as needed, including local/Ollama if supported
  {
    id: "llm-ollama-llama2",
    name: "Ollama Llama 2",
    provider: "Ollama",
    model: AgentLLM.OLLAMA_LLAMA2,
    description: "Llama 2 running locally via Ollama.",
    apiKeyRequired: false,
    apiUrl: "http://localhost:11434/api/generate",
  },
];

// This could represent user-saved global LLM configurations/credentials
export let mockUserLLMConfigs: Record<
  AgentLLM,
  Partial<LLMConfig> & { apiKey?: string }
> = {
  [AgentLLM.OPENAI_GPT_4_TURBO]: {
    apiKey: "sk-mockOpenAIKey123",
    temperature: 0.7,
  },
  [AgentLLM.ANTHROPIC_CLAUDE_3_OPUS]: {
    apiKey: "sk-mockAnthropicKey456",
    temperature: 0.8,
  },
  // User might not have configured all LLMs
};

export const updateUserLLMConfig = (
  llm: AgentLLM,
  config: Partial<LLMConfig> & { apiKey?: string }
) => {
  if (!mockUserLLMConfigs[llm]) {
    mockUserLLMConfigs[llm] = {};
  }
  mockUserLLMConfigs[llm] = { ...mockUserLLMConfigs[llm], ...config };
};

export const getLLMConfigWithDefaults = (llm: AgentLLM): LLMConfig => {
  const userConfig = mockUserLLMConfigs[llm] || {};
  const modelDetails = mockAvailableLLMs.find((model) => model.model === llm);

  return {
    llm: llm,
    temperature: userConfig.temperature || 0.7,
    maxTokens: userConfig.maxTokens || 2048,
    topP: userConfig.topP || 1.0,
    topK: userConfig.topK,
    frequencyPenalty: userConfig.frequencyPenalty || 0,
    presencePenalty: userConfig.presencePenalty || 0,
    stopSequences: userConfig.stopSequences || [],
    apiKey: userConfig.apiKey,
    apiBaseUrl: modelDetails?.apiUrl,
  };
};
