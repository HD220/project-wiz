import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const MIN_LENGTH = 1;
const MAX_LENGTH = 5000;

const AnnotationTextSchema = z.string()
  .trim()
  .min(MIN_LENGTH, `Annotation text must be at least ${MIN_LENGTH} character long (after trimming).`)
  .max(MAX_LENGTH, `Annotation text must be no more than ${MAX_LENGTH} characters long (after trimming).`);

interface AnnotationTextProps extends ValueObjectProps {
  value: string;
}

export class AnnotationText extends AbstractValueObject<AnnotationTextProps> {
  private constructor(props: AnnotationTextProps) {
    super(props);
  }

  public static create(text: string): AnnotationText {
    const validationResult = AnnotationTextSchema.safeParse(text);
    if (!validationResult.success) {
      throw new ValueError('Invalid annotation text.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new AnnotationText({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: AnnotationText): boolean {
    return super.equals(vo);
  }
}

