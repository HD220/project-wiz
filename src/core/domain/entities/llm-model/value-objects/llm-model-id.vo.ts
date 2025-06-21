import { Identity } from "@/core/common/identity";
import { z } from "zod"; // For potential specific validation in create
import { DomainError } from "@/core/common/errors"; // For error handling

// Assuming LLMModelId is a string, like a slug or UUID.
// The base Identity class already validates for UUID if it's a string.
const llmModelIdSchema = z.string().min(1, { message: "LLMModelId cannot be empty." }); // Example specific validation

export class LLMModelId extends Identity<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(id: string): LLMModelId {
    try {
      // Add any specific validation for LLMModelId format if different from general Identity string format
      llmModelIdSchema.parse(id); // Example: ensure it's not just any string but meets certain criteria
      return new LLMModelId(id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid LLMModelId: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public equals(other?: LLMModelId): boolean {
    if (!other || !(other instanceof LLMModelId)) {
        return false;
    }
    return super.equals(other);
  }
}
