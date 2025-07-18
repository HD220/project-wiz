import { LLMProvider } from "../entities";
import {
  ProviderType,
  ModelConfig,
  Temperature,
  MaxTokens,
} from "../value-objects";

export type LlmProviderWithData = LLMProvider & {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function createLlmProviderFromData(
  data: Record<string, unknown>,
): LlmProviderWithData {
  const providerType = new ProviderType(
    data.provider as "openai" | "deepseek" | "anthropic" | "ollama",
  );
  const modelConfig = new ModelConfig(
    new Temperature(0.7),
    new MaxTokens(1000),
  );

  const provider = new LLMProvider(providerType, modelConfig);

  return Object.assign(provider, {
    id: data.id as string,
    name: data.name as string,
    provider: data.provider as string,
    model: data.model as string,
    apiKey: data.apiKey as string,
    isDefault: data.isDefault as boolean,
    createdAt: data.createdAt as Date,
    updatedAt: data.updatedAt as Date,
  });
}
