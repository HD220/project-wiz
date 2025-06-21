import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const llmProviderConfigApiKeySchema = z.string().min(1, { message: "API key cannot be empty." });

export class LLMProviderConfigApiKey {
  private constructor(private readonly _value: string) {
    llmProviderConfigApiKeySchema.parse(this._value);
  }

  public static create(apiKey: string): LLMProviderConfigApiKey {
    return new LLMProviderConfigApiKey(apiKey);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: LLMProviderConfigApiKey): boolean {
    if (!other || !(other instanceof LLMProviderConfigApiKey)) {
        return false;
    }
    return this._value === other._value;
  }
}
