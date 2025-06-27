// src_refactored/core/domain/job/value-objects/job-timestamp.vo.ts
import { z } from 'zod';

import { ValueError } from '@/core/common/errors';
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

// Timestamps are stored as epoch milliseconds
const jobTimestampSchema = z.number()
  .int({ message: "Timestamp must be an integer representing milliseconds." })
  .nonnegative({ message: "Timestamp must be non-negative." });

export interface JobTimestampProps extends ValueObjectProps {
  value: number; // epoch milliseconds
}

export class JobTimestampVO extends AbstractValueObject<JobTimestampProps> {
  private constructor(props: JobTimestampProps) {
    super(props);
  }

  public static create(dateOrMs: Date | number): JobTimestampVO {
    const ms = typeof dateOrMs === 'number' ? dateOrMs : dateOrMs.getTime();
    try {
      jobTimestampSchema.parse(ms);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid timestamp: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e;
    }
    return new JobTimestampVO({ value: ms });
  }

  public static now(): JobTimestampVO {
    return new JobTimestampVO({ value: Date.now() });
  }

  public get value(): number { // Returns epoch milliseconds
    return this.props.value;
  }

  public asDate(): Date {
    return new Date(this.props.value);
  }

  // equals method is inherited from AbstractValueObject
  public toString(): string {
    return this.asDate().toISOString();
  }
}
