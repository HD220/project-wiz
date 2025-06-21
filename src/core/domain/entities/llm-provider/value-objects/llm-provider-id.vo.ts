import { Identity } from "@/core/common/identity";
import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Assuming LLMProviderId is a string (e.g., UUID or a unique string key)
const llmProviderIdSchema = z.string().min(1, { message: "LLMProviderId cannot be empty." });

export class LLMProviderId extends Identity<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(id: string): LLMProviderId {
    try {
      llmProviderIdSchema.parse(id);
      return new LLMProviderId(id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid LLMProviderId: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public equals(other?: LLMProviderId): boolean {
    if (!other || !(other instanceof LLMProviderId)) {
        return false;
    }
    return super.equals(other);
  }
}
