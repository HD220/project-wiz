import { z } from "zod";

const ProviderTypeSchema = z.enum([
  "openai",
  "deepseek",
  "anthropic",
  "ollama",
]);

export type ProviderTypeValue = z.infer<typeof ProviderTypeSchema>;

export class ProviderType {
  constructor(type: ProviderTypeValue) {
    const validated = ProviderTypeSchema.parse(type);
    this.value = validated;
  }

  private readonly value: ProviderTypeValue;

  getValue(): ProviderTypeValue {
    return this.value;
  }

  equals(other: ProviderType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isOpenAI(): boolean {
    return this.value === "openai";
  }

  isDeepSeek(): boolean {
    return this.value === "deepseek";
  }

  requiresApiKey(): boolean {
    return this.value !== "ollama";
  }
}
