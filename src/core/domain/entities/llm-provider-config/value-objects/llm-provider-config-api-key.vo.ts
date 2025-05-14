import { z } from "zod";

const llmProviderConfigApiKeySchema = z.string();
export class LLMProviderConfigApiKey {
  constructor(private readonly apiKey: string) {
    llmProviderConfigApiKeySchema.parse(apiKey);
  }
  get value() {
    return this.apiKey;
  }
}
