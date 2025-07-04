// src_refactored/core/domain/user/value-objects/user-username.vo.ts
import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const UserUsernameSchema = z.string()
  .trim()
  .min(3, 'Username must be at least 3 characters long.')
  .max(30, 'Username must be no more than 30 characters long.')
  .regex(/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/,
    'Username can only contain lowercase letters, numbers, underscores, and hyphens. ' +
    'It must start and end with a letter or number.'
  );

interface UserUsernameProps extends ValueObjectProps {
  value: string;
}

export class UserUsername extends AbstractValueObject<UserUsernameProps> {
  private constructor(props: UserUsernameProps) {
    super(props);
  }

  public static create(username: string): UserUsername {
    const validationResult = UserUsernameSchema.safeParse(username.toLowerCase());
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid username format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new UserUsername({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: UserUsername): boolean {
    return super.equals(vo);
  }
}
