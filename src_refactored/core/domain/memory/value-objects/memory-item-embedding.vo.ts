import { z } from 'zod';

import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";
import { ValueError } from "@/core/domain/common/errors";

const MemoryItemEmbeddingSchema = z.array(z.number().finite())
  .min(1, 'Embedding array cannot be empty if provided. Use null for no embedding.')
  .nullable();

interface MemoryItemEmbeddingProps extends ValueObjectProps {
  value: number[] | null;
}

export class MemoryItemEmbedding extends AbstractValueObject<MemoryItemEmbeddingProps> {
  private constructor(props: MemoryItemEmbeddingProps) {
    super(props);
  }

  public static create(
    embedding: number[] | null | undefined
  ): MemoryItemEmbedding {
    const validationResult = MemoryItemEmbeddingSchema.safeParse(embedding);

    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid memory item embedding format: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new MemoryItemEmbedding({ value: validationResult.data });
  }

  public get value(): number[] | null {
    return this.props.value === null ? null : [...this.props.value];
  }

  public equals(vo?: MemoryItemEmbedding): boolean {
    return super.equals(vo);
  }
}
