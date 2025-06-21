import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const userNicknameSchema = z.string().min(1, { message: "Nickname cannot be empty." });

export class UserNickname {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(nickname: string): UserNickname {
    try {
      userNicknameSchema.parse(nickname);
      return new UserNickname(nickname);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid UserNickname: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: UserNickname): boolean {
    return !!other && this._value === other._value;
  }
}
