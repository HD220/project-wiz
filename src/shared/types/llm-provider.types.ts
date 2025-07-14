export interface CreateLlmProviderDto {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault?: boolean;
}

export interface UpdateLlmProviderDto extends Partial<CreateLlmProviderDto> {
  id: string;
}

export interface LlmProviderDto {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LlmProviderFilterDto {
  name?: string;
  provider?: string;
  isDefault?: boolean;
}

export interface GenerateTextRequestDto {
  providerId: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}
