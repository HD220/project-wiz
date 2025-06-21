import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Slugs typically are non-empty and might have format restrictions
const llmProviderSlugSchema = z.string().min(1, { message: "LLM provider slug cannot be empty." });
// Example for more specific slug: .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export class LLMProviderSlug {
  private constructor(private readonly _value: string) {
    llmProviderSlugSchema.parse(this._value);
  }

  public static create(slug: string): LLMProviderSlug {
    return new LLMProviderSlug(slug);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: LLMProviderSlug): boolean {
    if (!other || !(other instanceof LLMProviderSlug)) {
        return false;
    }
    return this._value === other._value;
  }
}
