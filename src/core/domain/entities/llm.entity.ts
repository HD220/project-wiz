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

export type LLMSettings = Record<AgentLLM, Partial<LLMConfig>>;