// src_refactored/core/domain/user/value-objects/user-avatar.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../common/value-objects/base.vo';
import { ValueError } from '../../../../common/errors';

interface UserAvatarProps extends ValueObjectProps {
  value: string | null; // Avatar can be optional, represented by null
}

export class UserAvatar extends AbstractValueObject<UserAvatarProps> {
  private constructor(props: UserAvatarProps) {
    super(props);
  }

  public static create(avatarUrl: string | null | undefined): UserAvatar {
    if (avatarUrl === null || avatarUrl === undefined || avatarUrl.trim() === '') {
      return new UserAvatar({ value: null }); // Store empty or undefined as null
    }
    this.validate(avatarUrl);
    return new UserAvatar({ value: avatarUrl });
  }

  private static validate(avatarUrl: string): void {
    try {
      const url = new URL(avatarUrl);
      // Basic check for http or https protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new ValueError('Avatar URL must use http or https protocol.');
      }
      // Optionally, check for valid image extensions if desired, though this can be restrictive.
      // e.g., if (!/\.(jpeg|jpg|gif|png)$/i.test(url.pathname)) {
      //   throw new ValueError('Avatar URL does not point to a valid image type.');
      // }
    } catch (error) {
      if (error instanceof ValueError) throw error; // Re-throw if it's already a ValueError
      throw new ValueError(`Invalid URL format for avatar: ${avatarUrl}`);
    }

    if (avatarUrl.length > 2048) { // Common URL length limit
        throw new ValueError('Avatar URL is too long.');
    }
  }

  public value(): string | null {
    return this.props.value;
  }

  // equals is inherited from AbstractValueObject
}
