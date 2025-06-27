// src_refactored/core/domain/job/value-objects/attempt-count.vo.ts
import { z } from 'zod';
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/common/errors';

const attemptCountSchema = z.number()
  .int({ message: "Attempt count must be an integer." })
  .min(0, { message: "Attempt count cannot be negative." });

export interface AttemptCountProps extends ValueObjectProps {
  value: number;
}

export class AttemptCountVO extends AbstractValueObject<AttemptCountProps> {
  private constructor(props: AttemptCountProps) {
    super(props);
  }

  public static create(count: number): AttemptCountVO {
    try {
      attemptCountSchema.parse(count);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid attempt count: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e;
    }
    return new AttemptCountVO({ value: count });
  }

  public get value(): number {
    return this.props.value;
  }

  public increment(): AttemptCountVO {
    return new AttemptCountVO({ value: this.props.value + 1 });
  }
}
