// src/core/domain/user/value-objects/user-nickname.vo.ts
import { z } from "zod";

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from "@/core/domain/common/errors";

const UserNicknameSchema = z
  .string()
  .trim()
  .min(2, "Nickname must be at least 2 characters long.")
  .max(50, "Nickname must be no more than 50 characters long.");

interface UserNicknameProps extends ValueObjectProps {
  value: string;
}

export class UserNickname extends AbstractValueObject<UserNicknameProps> {
  private constructor(props: UserNicknameProps) {
    super(props);
  }

  public static create(nickname: string): UserNickname {
    const validationResult = UserNicknameSchema.safeParse(nickname);
    if (!validationResult.success) {
      const errorMessages = Object.values(
        validationResult.error.flatten().fieldErrors
      )
        .flat()
        .join("; ");
      throw new ValueError(`Invalid nickname format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new UserNickname({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: UserNickname): boolean {
    return super.equals(vo);
  }
}
