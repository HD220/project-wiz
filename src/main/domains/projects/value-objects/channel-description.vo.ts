import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ChannelDescriptionSchema = z
  .string()
  .max(500, "Channel description cannot exceed 500 characters")
  .nullable()
  .optional();

export class ChannelDescription {
  private readonly value: string | null;

  constructor(description?: string | null) {
    if (!description) {
      this.value = null;
      return;
    }

    const sanitized = ValidationUtils.sanitizeString(description);

    try {
      this.value = ChannelDescriptionSchema.parse(sanitized) ?? null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField(
          "channelDescription",
          firstError.message,
          description,
        );
      }
      throw error;
    }
  }

  getValue(): string | null {
    return this.value;
  }

  equals(other: ChannelDescription): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ?? "";
  }

  isEmpty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }

  static isValid(description?: string | null): boolean {
    try {
      if (!description) return true;
      const sanitized = ValidationUtils.sanitizeString(description);
      ChannelDescriptionSchema.parse(sanitized);
      return true;
    } catch {
      return false;
    }
  }
}
