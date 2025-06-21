import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const userEmailSchema = z.string().email({ message: "Invalid email format." });

export class UserEmail {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(email: string): UserEmail {
    try {
      userEmailSchema.parse(email);
      return new UserEmail(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid UserEmail: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: UserEmail): boolean {
    return !!other && this._value === other._value;
  }
}
