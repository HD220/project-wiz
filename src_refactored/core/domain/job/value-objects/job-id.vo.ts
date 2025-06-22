// src_refactored/core/domain/job/value-objects/job-id.vo.ts
import { Identity } from '../../../../core/common/value-objects/identity.vo';

export class JobId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): JobId {
    return new JobId(super.generate().value());
  }

  public static fromString(value: string): JobId {
    return new JobId(value);
  }
}
