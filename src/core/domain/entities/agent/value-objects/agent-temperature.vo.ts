import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const agentTemperatureSchema = z.number().min(0).max(2)
  .describe("Agent temperature must be between 0 and 2 (inclusive).");

export class AgentTemperature {
  private constructor(private readonly _value: number) {
    // Validation is handled by Zod in the static create method or constructor.
    // For consistency with example, parsing in constructor.
    agentTemperatureSchema.parse(this._value);
  }

  public static create(temperature: number): AgentTemperature {
    try {
      // Validate here if constructor becomes truly private without self-validation
      // agentTemperatureSchema.parse(temperature);
      return new AgentTemperature(temperature);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid AgentTemperature: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): number {
    return this._value;
  }

  public equals(other?: AgentTemperature): boolean {
    if (!other || !(other instanceof AgentTemperature)) {
        return false;
    }
    // Floating point comparisons might need a tolerance if not exact
    return this._value === other._value;
  }
}
