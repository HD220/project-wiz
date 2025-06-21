import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Slugs typically are non-empty and might have format restrictions (e.g., lowercase, no spaces)
// Example: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const llmModelSlugSchema = z.string().min(1, { message: "LLM model slug cannot be empty." });

export class LLMModelSlug {
  private constructor(private readonly _value: string) {
    llmModelSlugSchema.parse(this._value);
  }

  public static create(slug: string): LLMModelSlug {
    return new LLMModelSlug(slug);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: LLMModelSlug): boolean {
    if (!other || !(other instanceof LLMModelSlug)) {
        return false;
    }
    return this._value === other._value;
  }
}
