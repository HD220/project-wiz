// src_refactored/core/domain/user/value-objects/user-nickname.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/domain/common/errors';

interface UserNicknameProps extends ValueObjectProps {
  value: string;
}

export class UserNickname extends AbstractValueObject<UserNicknameProps> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(props: UserNicknameProps) {
    super(props);
  }

  public static create(nickname: string): UserNickname {
    this.validate(nickname);
    return new UserNickname({ value: nickname });
  }

  private static validate(nickname: string): void {
    if (nickname === null || nickname === undefined || nickname.trim() === '') {
      throw new ValueError('Nickname cannot be empty.');
    }
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < this.MIN_LENGTH) {
      throw new ValueError(`Nickname must be at least ${this.MIN_LENGTH} characters long.`);
    }
    if (trimmedNickname.length > this.MAX_LENGTH) {
      throw new ValueError(`Nickname must be no more than ${this.MAX_LENGTH} characters long.`);
    }
    // Potentially add other validation rules, e.g., allowed characters
  }

  public value(): string {
    return this.props.value;
  }

  // equals is inherited from AbstractValueObject
}
