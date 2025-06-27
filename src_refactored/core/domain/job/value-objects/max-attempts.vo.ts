// src_refactored/core/domain/job/value-objects/max-attempts.vo.ts
import { z } from 'zod';
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/common/errors';

const maxAttemptsSchema = z.number()
  .int({ message: "Max attempts must be an integer." })
  .positive({ message: "Max attempts must be a positive integer." });

export interface MaxAttemptsProps extends ValueObjectProps {
  value: number;
}

export class MaxAttemptsVO extends AbstractValueObject<MaxAttemptsProps> {
  private constructor(props: MaxAttemptsProps) {
    super(props);
  }

  public static create(value: number): MaxAttemptsVO {
    try {
      maxAttemptsSchema.parse(value);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid max attempts: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e;
    }
    return new MaxAttemptsVO({ value });
  }

  public get value(): number {
    return this.props.value;
  }
}
