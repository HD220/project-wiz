import {
  LLMConfig,
  AgentLLM,
  LLMSettings,
} from "../../../../shared/types/entities";

// This could represent globally available LLM models or presets
export const mockAvailableLLMs: LLMConfig[] = [
  {
    id: "llm-openai-gpt-4-turbo",
    name: "OpenAI GPT-4 Turbo",
    providerId: "OpenAI",
    llm: AgentLLM.OPENAI_GPT_4_TURBO,
    temperature: 0.7,
    maxTokens: 4096,
    baseUrl: "https://api.openai.com/v1/chat/completions",
  },
  {
    id: "llm-openai-gpt-3.5-turbo",
    name: "OpenAI GPT-3.5 Turbo",
    providerId: "OpenAI",
    llm: AgentLLM.OPENAI_GPT_3_5_TURBO,
    temperature: 0.7,
    maxTokens: 4096,
    baseUrl: "https://api.openai.com/v1/chat/completions",
  },
  {
    id: "llm-anthropic-claude-3-opus",
    name: "Anthropic Claude 3 Opus",
    providerId: "Anthropic",
    llm: AgentLLM.ANTHROPIC_CLAUDE_3_OPUS,
    temperature: 0.7,
    maxTokens: 4096,
    baseUrl: "https://api.anthropic.com/v1/messages",
  },
  {
    id: "llm-anthropic-claude-3-sonnet",
    name: "Anthropic Claude 3 Sonnet",
    providerId: "Anthropic",
    llm: AgentLLM.ANTHROPIC_CLAUDE_3_SONNET,
    temperature: 0.7,
    maxTokens: 4096,
    baseUrl: "https://api.anthropic.com/v1/messages",
  },
  {
    id: "llm-google-gemini-pro",
    name: "Google Gemini Pro",
    providerId: "Google",
    llm: AgentLLM.GOOGLE_GEMINI_PRO,
    temperature: 0.7,
    maxTokens: 4096,
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  },
  // Add more mock LLMs as needed, including local/Ollama if supported
  {
    id: "llm-ollama-llama2",
    name: "Ollama Llama 2",
    providerId: "Ollama",
    llm: AgentLLM.OLLAMA_LLAMA2,
    temperature: 0.7,
    maxTokens: 4096,
    baseUrl: "http://localhost:11434/api/generate",
  },
];

// This could represent user-saved global LLM configurations/credentials
export let mockUserLLMConfigs: Record<
  AgentLLM,
  Partial<LLMConfig>
> = {
  [AgentLLM.OPENAI_GPT_4_TURBO]: {
    apiKey: "sk-mockOpenAIKey123",
  },
  [AgentLLM.ANTHROPIC_CLAUDE_3_OPUS]: {
    apiKey: "sk-mockAnthropicKey456",
  },
  [AgentLLM.OPENAI_GPT_3_5_TURBO]: {},
  [AgentLLM.ANTHROPIC_CLAUDE_3_SONNET]: {},
  [AgentLLM.GOOGLE_GEMINI_PRO]: {},
  [AgentLLM.OLLAMA_LLAMA2]: {},
  // User might not have configured all LLMs
};

export const updateUserLLMConfig = (
  llm: AgentLLM,
  config: Partial<LLMConfig>
) => {
  if (!mockUserLLMConfigs[llm]) {
    mockUserLLMConfigs[llm] = {};
  }
  mockUserLLMConfigs[llm] = { ...mockUserLLMConfigs[llm], ...config };
};

export const getLLMConfigWithDefaults = (llm: AgentLLM): LLMConfig => {
  const userConfig = mockUserLLMConfigs[llm] || {};
  const modelDetails = mockAvailableLLMs.find((model) => model.llm === llm);

  if (!modelDetails) {
    throw new Error(`LLM configuration not found for: ${llm}`);
  }

  return {
    id: modelDetails.id,
    name: modelDetails.name,
    providerId: modelDetails.providerId,
    llm: modelDetails.llm,
    temperature: userConfig.temperature ?? modelDetails.temperature,
    maxTokens: userConfig.maxTokens ?? modelDetails.maxTokens,
    baseUrl: userConfig.baseUrl ?? modelDetails.baseUrl,
    apiKey: userConfig.apiKey,
  };
};