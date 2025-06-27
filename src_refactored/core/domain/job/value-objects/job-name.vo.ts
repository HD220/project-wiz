// src_refactored/core/domain/job/value-objects/job-name.vo.ts
import { z } from 'zod';

import { ValueError } from '@/core/common/errors';
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

const jobNameSchema = z.string()
  .min(1, { message: "Job name cannot be empty." })
  .max(255, { message: "Job name must be 255 characters or less." }); // Added max length for good measure

export interface JobNameProps extends ValueObjectProps {
  value: string;
}

export class JobNameVO extends AbstractValueObject<JobNameProps> {
  private constructor(props: JobNameProps) {
    super(props);
  }

  public static create(name: string): JobNameVO {
    try {
      jobNameSchema.parse(name);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid job name: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e; // Re-throw other errors
    }
    return new JobNameVO({ value: name });
  }

  public get value(): string {
    return this.props.value;
  }
}
