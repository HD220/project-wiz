import { DomainError } from "@/core/common/errors";
import { z, ZodError } from "zod";

export const identity = z.union([z.string().uuid(), z.number().int()]);
export type IdentityType = z.infer<typeof identity>;

export class Identity<T extends string | number> {
  constructor(public readonly value: T) {
    try {
      identity.parse(value);
    } catch (error) {
      const validationError = error as ZodError;
      throw new DomainError(validationError.message, validationError.stack);
    }
  }
}
