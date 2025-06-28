// src_refactored/core/domain/job/value-objects/job-name.vo.ts
import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors'; // Corrected alias path

const jobNameSchema = z.string()
  .min(1, { message: "Job name cannot be empty." })
  .max(255, { message: "Job name must be 255 characters or less." });

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
    } catch (error) { // Renamed e to error
      if (error instanceof z.ZodError) {
        throw new ValueError(`Invalid job name: ${error.errors.map(err => err.message).join(', ')}`);
      }
      throw error; // Re-throw error
    }
    return new JobNameVO({ value: name });
  }

  public get value(): string {
    return this.props.value;
  }
}
