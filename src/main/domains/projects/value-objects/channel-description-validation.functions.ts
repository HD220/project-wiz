import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ChannelDescriptionSchema = z
  .string()
  .max(500, "Channel description cannot exceed 500 characters")
  .nullable()
  .optional();

export function validateChannelDescription(
  description?: string | null
): string | null {
  if (!description) {
    return null;
  }

  const sanitized = ValidationUtils.sanitizeString(description);

  try {
    return ChannelDescriptionSchema.parse(sanitized) ?? null;
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

export function isValidChannelDescription(
  description?: string | null
): boolean {
  try {
    if (!description) return true;
    const sanitized = ValidationUtils.sanitizeString(description);
    ChannelDescriptionSchema.parse(sanitized);
    return true;
  } catch {
    return false;
  }
}