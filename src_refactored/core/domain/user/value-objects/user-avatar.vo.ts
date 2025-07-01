import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

import { ValueError } from "@/domain/common/errors";

interface UserAvatarProps extends ValueObjectProps {
  value: string | null;
}

export class UserAvatar extends AbstractValueObject<UserAvatarProps> {
  private constructor(props: UserAvatarProps) {
    super(props);
  }

  public static create(avatarUrl: string | null | undefined): UserAvatar {
    if (
      avatarUrl === null ||
      avatarUrl === undefined ||
      avatarUrl.trim() === ""
    ) {
      return new UserAvatar({ value: null });
    }
    this.validate(avatarUrl);
    return new UserAvatar({ value: avatarUrl });
  }

  private static validate(avatarUrl: string): void {
    try {
      const url = new URL(avatarUrl);
      // Basic check for http or https protocols
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new ValueError("Avatar URL must use http or https protocol.");
      }
    } catch (error) {
      if (error instanceof ValueError) throw error;
      throw new ValueError(`Invalid URL format for avatar: ${avatarUrl}`);
    }

    if (avatarUrl.length > 2048) {
      throw new ValueError("Avatar URL is too long.");
    }
  }

  public value(): string | null {
    return this.props.value;
  }
}
