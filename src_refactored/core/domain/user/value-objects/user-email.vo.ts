// src_refactored/core/domain/user/value-objects/user-email.vo.ts
import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const UserEmailSchema = z.string()
  .trim()
  .email('Invalid email format.')
  .max(254, 'Email address is too long.');

interface UserEmailProps extends ValueObjectProps {
  value: string;
}

export class UserEmail extends AbstractValueObject<UserEmailProps> {
  private constructor(props: UserEmailProps) {
    super(props);
  }

  public static create(email: string): UserEmail {
    const validationResult = UserEmailSchema.safeParse(email.toLowerCase());
    if (!validationResult.success) {
      throw new ValueError('Invalid email format.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new UserEmail({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: UserEmail): boolean {
    return super.equals(vo);
  }
}
