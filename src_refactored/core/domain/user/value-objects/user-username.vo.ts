// src_refactored/core/domain/user/value-objects/user-username.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../common/value-objects/base.vo';
import { ValueError } from '../../../../common/errors';

interface UserUsernameProps extends ValueObjectProps {
  value: string;
}

export class UserUsername extends AbstractValueObject<UserUsernameProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 30;
  // Regex for valid usernames: lowercase alphanumeric, underscores, hyphens
  // Must start and end with an alphanumeric character
  private static readonly USERNAME_REGEX = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/;

  private constructor(props: UserUsernameProps) {
    super(props);
  }

  public static create(username: string): UserUsername {
    this.validate(username);
    // It's generally good practice for usernames to be stored in a consistent case, e.g., lowercase
    return new UserUsername({ value: username.toLowerCase() });
  }

  private static validate(username: string): void {
    if (username === null || username === undefined || username.trim() === '') {
      throw new ValueError('Username cannot be empty.');
    }
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < this.MIN_LENGTH) {
      throw new ValueError(`Username must be at least ${this.MIN_LENGTH} characters long.`);
    }
    if (trimmedUsername.length > this.MAX_LENGTH) {
      throw new ValueError(`Username must be no more than ${this.MAX_LENGTH} characters long.`);
    }
    if (!this.USERNAME_REGEX.test(trimmedUsername.toLowerCase())) {
      throw new ValueError(
        'Username can only contain lowercase letters, numbers, underscores, and hyphens. ' +
        'It must start and end with a letter or number.'
      );
    }
  }

  public value(): string {
    return this.props.value;
  }

  // equals is inherited from AbstractValueObject
}
