import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const llmProviderNameSchema = z.string().min(1, { message: "LLM provider name cannot be empty." });

export class LLMProviderName {
  private constructor(private readonly _value: string) {
    llmProviderNameSchema.parse(this._value);
  }

  public static create(name: string): LLMProviderName {
    return new LLMProviderName(name);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: LLMProviderName): boolean {
    if (!other || !(other instanceof LLMProviderName)) {
        return false;
    }
    return this._value === other._value;
  }
}
