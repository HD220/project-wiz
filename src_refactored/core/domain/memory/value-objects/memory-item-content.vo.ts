import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from "@/core/domain/common/errors";

const MemoryItemContentSchema = z.string()
  .trim()
  .min(1, 'Memory item content must be at least 1 character long (after trimming).')
  .max(10000, 'Memory item content must be no more than 10000 characters long (after trimming).');

interface MemoryItemContentProps extends ValueObjectProps {
  value: string;
}

export class MemoryItemContent extends AbstractValueObject<MemoryItemContentProps> {
  private constructor(props: MemoryItemContentProps) {
    super(props);
  }

  public static create(content: string): MemoryItemContent {
    const validationResult = MemoryItemContentSchema.safeParse(content);

    if (!validationResult.success) {
      throw new ValueError('Invalid memory item content format.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new MemoryItemContent({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }
}
