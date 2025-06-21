import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Assuming avatar URL must be a valid URL if provided.
// If an empty string is allowed for "no avatar", schema could be .url().or(z.literal(''))
// Or if it can be other non-URL strings, then just z.string()
const userAvatarSchema = z.string().url({ message: "Invalid URL format for avatar." });
// If it can be optional or an empty string to signify no avatar:
// const userAvatarSchema = z.string().url().optional(); // Or .or(z.literal(''))

export class UserAvatar {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(url: string): UserAvatar {
    try {
      // If an empty string should represent "no avatar" and is permissible:
      // if (url === "") return new UserAvatar("");
      userAvatarSchema.parse(url);
      return new UserAvatar(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid UserAvatar URL: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: UserAvatar): boolean {
    return !!other && this._value === other._value;
  }
}
