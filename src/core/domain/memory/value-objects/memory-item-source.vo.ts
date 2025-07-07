import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from "@/core/domain/common/common-domain.errors";

const MemoryItemSourceSchema = z.string()
  .trim()
  .max(100, 'Memory item source must be no more than 100 characters long.')
  .nullable();

interface MemoryItemSourceProps extends ValueObjectProps {
  value: string | null;
}

export class MemoryItemSource extends AbstractValueObject<MemoryItemSourceProps> {
  private constructor(props: MemoryItemSourceProps) {
    super(props);
  }

  public static create(source: string | null | undefined): MemoryItemSource {
    const validationResult = MemoryItemSourceSchema.safeParse(source);

    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid memory item source format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new MemoryItemSource({ value: validationResult.data });
  }

  public get value(): string | null {
    return this.props.value;
  }
}

