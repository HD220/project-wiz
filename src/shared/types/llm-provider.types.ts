export interface CreateLlmProviderDto {
  name: string;
  provider: string;
  model: string;
  apiKey: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LlmProviderFilterDto {
  name?: string;
  provider?: string;
}
