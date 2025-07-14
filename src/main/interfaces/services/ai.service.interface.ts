import type { ChatMessage } from "../../modules/llm-provider/application/ai-service";

export interface IAIService {
  generateResponse(
    messages: ChatMessage[],
    llmProviderId?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<string>;

  validateLlmProviderConfiguration(llmProviderId: string): Promise<boolean>;

  streamResponse(
    messages: ChatMessage[],
    llmProviderId?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): AsyncIterable<string>;
}
