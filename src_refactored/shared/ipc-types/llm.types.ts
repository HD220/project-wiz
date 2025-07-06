export enum AgentLLM {
  OPENAI_GPT_4_TURBO = "openai-gpt-4-turbo",
  OPENAI_GPT_3_5_TURBO = "openai-gpt-3-5-turbo",
  ANTHROPIC_CLAUDE_3_OPUS = "anthropic-claud-3-opus",
  ANTHROPIC_CLAUDE_3_SONNET = "anthropic-claud-3-sonnet",
  GOOGLE_GEMINI_PRO = "google-gemini-pro",
  OLLAMA_LLAMA2 = "ollama-llama2",
}

export interface LLMConfig {
  id: string;
  name: string;
  providerId: string;
  llm: AgentLLM;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
  apiKey?: string;
}

export interface LLMConfigFormData {
  name: string;
  providerId: "openai" | "deepseek" | "ollama" | string;
  apiKey?: string;
  baseUrl?: string;
}

// LLM Configurations
export type GetLLMConfigsListRequest = void;
export type GetLLMConfigsListResponse = Record<AgentLLM, LLMConfig>;

export type GetAvailableLLMsResponse = LLMConfig[];

export type GetLLMConfigDetailsRequest = { configId: string };
export type GetLLMConfigDetailsResponse = LLMConfig | null;

export type CreateLLMConfigRequest = LLMConfigFormData;
export type CreateLLMConfigResponse = LLMConfig;

export type UpdateLLMConfigRequest = {
  configId: string;
  data: Partial<LLMConfigFormData>;
};
export type UpdateLLMConfigResponse = LLMConfig;

export type DeleteLLMConfigRequest = { configId: string };
export type DeleteLLMConfigResponse = { success: boolean };

export type LLMConfigsUpdatedEventPayload = LLMConfig[];
