// src_refactored/core/domain/job/value-objects/job-id.vo.ts
import { v4 as uuidv4 } from 'uuid';

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/common/errors';

export class JobIdVO extends AbstractValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): JobIdVO {
    const id = value || uuidv4();
    if (!JobIdVO.isValidUUID(id)) {
      throw new ValueError('Invalid Job ID format. Must be a valid UUID.');
    }
    return new JobIdVO(id);
  }

  public static generate(): JobIdVO {
    const newId = uuidv4();
    if (!JobIdVO.isValidUUID(newId)) {
      throw new Error('Generated UUID is invalid, which is unexpected.');
    }
    return new JobIdVO(newId);
  }

  private static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  public get value(): string {
    return this.props.value;
  }
}
