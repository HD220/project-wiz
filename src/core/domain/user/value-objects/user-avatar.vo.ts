import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from "@/core/domain/common/common-domain.errors";

const UserAvatarSchema = z.string()
  .url("Invalid URL format for avatar.")
  .max(2048, "Avatar URL is too long.")
  .refine(url => url.startsWith('http://') || url.startsWith('https://'), {
    message: "Avatar URL must use http or https protocol."
  })
  .nullable();

interface UserAvatarProps extends ValueObjectProps {
  value: string | null;
}

export class UserAvatar extends AbstractValueObject<UserAvatarProps> {
  private constructor(props: UserAvatarProps) {
    super(props);
  }

  public static create(avatarUrl: string | null | undefined): UserAvatar {
    const validationResult = UserAvatarSchema.safeParse(avatarUrl);

    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid avatar URL format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new UserAvatar({ value: validationResult.data });
  }

  public get value(): string | null {
    return this.props.value;
  }

  public equals(vo?: UserAvatar): boolean {
    return super.equals(vo);
  }
}
