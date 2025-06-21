import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Added basic validation, can be made more specific (min/max length, regex)
const userUsernameSchema = z.string().min(1, { message: "Username cannot be empty." });

export class UserUsername {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(username: string): UserUsername {
    try {
      userUsernameSchema.parse(username);
      return new UserUsername(username);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid UserUsername: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: UserUsername): boolean {
    return !!other && this._value === other._value;
  }
}
