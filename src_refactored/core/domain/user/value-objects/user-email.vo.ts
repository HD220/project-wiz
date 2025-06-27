// src_refactored/core/domain/user/value-objects/user-email.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors';

interface UserEmailProps extends ValueObjectProps {
  value: string;
}

export class UserEmail extends AbstractValueObject<UserEmailProps> {
  // Basic email regex. For production, a more robust validation library might be preferred.
  // This regex checks for a common structure: local-part@domain-part
  // local-part: alphanumeric characters, dots, hyphens, pluses
  // domain-part: alphanumeric characters, dots, hyphens, with at least one dot
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private constructor(props: UserEmailProps) {
    super(props);
  }

  public static create(email: string): UserEmail {
    this.validate(email);
    // Emails are often case-insensitive in the local part, but domain part is case-insensitive by spec.
    // Storing as lowercase is a common practice to avoid duplicates.
    return new UserEmail({ value: email.toLowerCase() });
  }

  private static validate(email: string): void {
    if (email === null || email === undefined || email.trim() === '') {
      throw new ValueError('Email cannot be empty.');
    }
    const trimmedEmail = email.trim();
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      throw new ValueError(`Invalid email format: ${email}`);
    }
    // Max length for email is typically 254 characters
    if (trimmedEmail.length > 254) {
        throw new ValueError('Email address is too long.');
    }
  }

  public value(): string {
    return this.props.value;
  }

  // equals is inherited from AbstractValueObject
}
