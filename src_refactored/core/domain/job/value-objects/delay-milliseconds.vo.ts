// src_refactored/core/domain/job/value-objects/delay-milliseconds.vo.ts
import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors'; // Corrected alias path

const delayMillisecondsSchema = z.number()
  .int({ message: "Delay milliseconds must be an integer." })
  .nonnegative({ message: "Delay milliseconds must be a non-negative integer." });

export interface DelayMillisecondsProps extends ValueObjectProps {
  value: number;
}

export class DelayMillisecondsVO extends AbstractValueObject<DelayMillisecondsProps> {
  private constructor(props: DelayMillisecondsProps) {
    super(props);
  }

  public static create(value: number): DelayMillisecondsVO {
    try {
      delayMillisecondsSchema.parse(value);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid delay milliseconds: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e;
    }
    return new DelayMillisecondsVO({ value });
  }

  public static zero(): DelayMillisecondsVO {
    return new DelayMillisecondsVO({ value: 0 });
  }

  public get value(): number {
    return this.props.value;
  }
}
