import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ChannelNameSchema = z
  .string()
  .min(2, "Channel name must have at least 2 characters")
  .max(50, "Channel name cannot exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9-_]+$/,
    "Channel name can only contain letters, numbers, hyphens and underscores",
  )
  .refine(
    (name) => !/^[-_]|[-_]$/.test(name),
    "Channel name cannot start or end with hyphen or underscore",
  );

export function normalizeChannelName(name: string): string {
  const sanitized = ValidationUtils.sanitizeString(name);
  return sanitized
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateChannelName(name: string): string {
  const normalized = normalizeChannelName(name);

  try {
    return ChannelNameSchema.parse(normalized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw ValidationError.singleField(
        "channelName",
        firstError.message,
        name,
      );
    }
    throw error;
  }
}

export function isValidChannelName(name: string): boolean {
  try {
    validateChannelName(name);
    return true;
  } catch {
    return false;
  }
}