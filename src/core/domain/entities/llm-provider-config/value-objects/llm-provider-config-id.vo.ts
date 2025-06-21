import { Identity } from "@/core/common/identity";
import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Assuming LLMProviderConfigId is a string (e.g., UUID)
const llmProviderConfigIdSchema = z.string().uuid({ message: "LLMProviderConfigId must be a valid UUID." });

export class LLMProviderConfigId extends Identity<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(id: string): LLMProviderConfigId {
    try {
      // Identity's constructor will validate against z.string().uuid()
      // but parsing here allows for specific error messages if needed for this particular ID type.
      llmProviderConfigIdSchema.parse(id);
      return new LLMProviderConfigId(id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid LLMProviderConfigId: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public equals(other?: LLMProviderConfigId): boolean {
    if (!other || !(other instanceof LLMProviderConfigId)) {
        return false;
    }
    return super.equals(other);
  }
}
