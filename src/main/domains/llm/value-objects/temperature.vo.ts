import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const TemperatureSchema = z
  .number()
  .min(0.0, "Temperature must be between 0.0 and 2.0")
  .max(2.0, "Temperature must be between 0.0 and 2.0")
  .refine(
    (temp) => ValidationUtils.isValidTemperature(temp),
    "Invalid temperature value",
  );

export class Temperature {
  private readonly value: number;

  static readonly DEFAULT = new Temperature(0.7);
  static readonly MIN = 0.0;
  static readonly MAX = 2.0;

  constructor(temperature: number) {
    try {
      this.value = TemperatureSchema.parse(temperature);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField(
          "temperature",
          firstError.message,
          temperature,
        );
      }
      throw error;
    }
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Temperature): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }

  toNumber(): number {
    return this.value;
  }

  isConservative(): boolean {
    return this.value <= 0.3;
  }

  isBalanced(): boolean {
    return this.value > 0.3 && this.value <= 0.9;
  }

  isCreative(): boolean {
    return this.value > 0.9;
  }

  static isValid(temperature: number): boolean {
    try {
      TemperatureSchema.parse(temperature);
      return true;
    } catch {
      return false;
    }
  }

  static fromString(temperatureStr: string): Temperature {
    const parsed = parseFloat(temperatureStr);
    if (isNaN(parsed)) {
      throw ValidationError.invalidFormat(
        "temperature",
        "number",
        temperatureStr,
      );
    }
    return new Temperature(parsed);
  }
}
