// src_refactored/core/domain/job/value-objects/job-id.vo.ts
import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const JobIdSchema = z.string().uuid('Invalid Job ID format (must be a valid UUID v4).');

interface JobIdProps {
  value: string;
  [key: string]: unknown;
}

export class JobIdVO extends AbstractValueObject<JobIdProps> {
  private constructor(props: JobIdProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(id?: string): JobIdVO {
    const jobId = id || randomUUID();
    const validationResult = JobIdSchema.safeParse(jobId);

    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid Job ID format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new JobIdVO({ value: validationResult.data });
  }

  public equals(vo?: JobIdVO): boolean {
    return super.equals(vo);
  }
}

