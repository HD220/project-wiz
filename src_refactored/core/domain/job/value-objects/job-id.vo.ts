// src_refactored/core/domain/job/value-objects/job-id.vo.ts
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

import { ValueObject } from '@/core/common/value-objects/base.vo';
import { DomainError } from '@/core/domain/common/errors';

interface JobIdProps {
  value: string;
}

export class JobIdVO extends ValueObject<JobIdProps> {
  private constructor(props: JobIdProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public static create(id?: string): JobIdVO {
    const jobId = id || uuidv4();
    if (!uuidValidate(jobId)) {
      throw new DomainError('Invalid Job ID format (must be a valid UUID).');
    }
    return new JobIdVO({ value: jobId });
  }

  public equals(other: JobIdVO): boolean {
    return this.props.value === other.props.value;
  }
}
