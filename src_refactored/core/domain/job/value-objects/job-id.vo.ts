// src_refactored/core/domain/job/value-objects/job-id.vo.ts
import { randomUUID } from 'node:crypto';

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { DomainError } from '@/core/domain/common/errors';

interface JobIdProps {
  value: string;
}

export class JobIdVO extends AbstractValueObject<JobIdProps> {
  private constructor(props: JobIdProps) {
    super(props);
  }

  public value(): string {
    return this.props.value;
  }

  // Basic UUID v4 regex for simple validation if an ID is provided externally.
  // Node's randomUUID() already produces valid v4 UUIDs.
  private static readonly UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public static create(id?: string): JobIdVO {
    const jobId = id || randomUUID();
    // Validate only if an ID was explicitly provided, as randomUUID() is inherently valid.
    if (id && !JobIdVO.UUID_V4_REGEX.test(jobId)) {
      throw new DomainError('Invalid Job ID format (must be a valid UUID v4).');
    }
    return new JobIdVO({ value: jobId });
  }

  public equals(other?: JobIdVO | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.props.value === other.props.value;
  }
}
