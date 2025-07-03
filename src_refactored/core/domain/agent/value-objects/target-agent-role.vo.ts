import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const TargetAgentRoleSchema = z.string()
  .trim()
  .min(1, 'Target agent role cannot be empty.');

interface TargetAgentRoleProps extends ValueObjectProps {
  value: string;
}

export class TargetAgentRoleVO extends AbstractValueObject<TargetAgentRoleProps> {
  private constructor(props: TargetAgentRoleProps) {
    super(props);
  }

  public static create(role: string): TargetAgentRoleVO {
    const validationResult = TargetAgentRoleSchema.safeParse(role);
    if (!validationResult.success) {
      throw new ValueError('Invalid target agent role.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new TargetAgentRoleVO({ value: validationResult.data.toLowerCase() });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: TargetAgentRoleVO): boolean {
    return super.equals(vo);
  }
}
