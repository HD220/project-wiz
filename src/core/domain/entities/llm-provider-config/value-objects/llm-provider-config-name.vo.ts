import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const llmProviderConfigNameSchema = z.string().min(1, { message: "LLM provider configuration name cannot be empty." });

export class LLMProviderConfigName {
  private constructor(private readonly _value: string) {
    llmProviderConfigNameSchema.parse(this._value);
  }

  public static create(name: string): LLMProviderConfigName {
    return new LLMProviderConfigName(name);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: LLMProviderConfigName): boolean {
    if (!other || !(other instanceof LLMProviderConfigName)) {
        return false;
    }
    return this._value === other._value;
  }
}
