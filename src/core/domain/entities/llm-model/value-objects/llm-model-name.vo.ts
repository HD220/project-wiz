import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const llmModelNameSchema = z.string().min(1, { message: "LLM model name cannot be empty." });

export class LLMModelName {
  private constructor(private readonly _value: string) {
    // Validation is handled by Zod in the static create method before calling constructor
    // or by parsing in the constructor if create just calls new directly after its own parse.
    // For consistency with the example, let's assume create calls new, and constructor parses.
    llmModelNameSchema.parse(this._value);
  }

  public static create(name: string): LLMModelName {
    // Option 1: Validate here, then call new.
    // try {
    //   llmModelNameSchema.parse(name);
    //   return new LLMModelName(name);
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     throw new DomainError(`Invalid LLMModelName: ${error.errors.map(e => e.message).join(', ')}`);
    //   }
    //   throw error;
    // }
    // Option 2: Let constructor handle validation (as per example in prompt)
    return new LLMModelName(name);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: LLMModelName): boolean {
    if (!other || !(other instanceof LLMModelName)) {
        return false;
    }
    return this._value === other._value;
  }
}
