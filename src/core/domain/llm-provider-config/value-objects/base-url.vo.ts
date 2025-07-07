import { z } from 'zod';

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/common-domain.errors';

interface BaseUrlProps {
  value: string;
  [key: string]: unknown;
}

const BaseUrlSchema = z
  .string()
  .url('Base URL must be a valid URL.')
  .max(2048, 'Base URL cannot exceed 2048 characters.');

export class BaseUrl extends AbstractValueObject<BaseUrlProps> {
  private constructor(props: BaseUrlProps) {
    super(props);
  }

  public static create(url: string): BaseUrl {
    const validationResult = BaseUrlSchema.safeParse(url);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid Base URL format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new BaseUrl({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: BaseUrl): boolean {
    return super.equals(vo);
  }
}
