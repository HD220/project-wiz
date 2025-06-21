import { DomainError } from "@/core/common/errors";
import { z, ZodError } from "zod";

export const identity = z.union([z.string().uuid(), z.number().int()]);
export type IdentityType = z.infer<typeof identity>;

export class Identity<T extends string | number> {
  // Changed 'value' to '_value' and made it private
  constructor(private readonly _value: T) {
    try {
      identity.parse(_value); // Validate _value
    } catch (error) {
      const validationError = error as ZodError;
      throw new DomainError(validationError.message, validationError.stack);
    }
  }

  // Added getValue() method
  public getValue(): T {
    return this._value;
  }

  equals(other: Identity<T>): boolean {
    // Adjusted to use _value from both instances
    return this._value === other._value;
  }
}
