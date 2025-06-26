// src_refactored/core/domain/annotation/value-objects/annotation-text.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/domain/common/errors';

interface AnnotationTextProps extends ValueObjectProps {
  value: string;
}

export class AnnotationText extends AbstractValueObject<AnnotationTextProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 5000; // Arbitrary max length, can be adjusted

  private constructor(props: AnnotationTextProps) {
    super(props);
  }

  public static create(text: string): AnnotationText {
    this.validate(text);
    return new AnnotationText({ value: text });
  }

  private static validate(text: string): void {
    if (text === null || text === undefined) {
      throw new ValueError('Annotation text cannot be null or undefined.');
    }
    const trimmedText = text.trim();
    if (trimmedText.length < this.MIN_LENGTH) {
      throw new ValueError(`Annotation text must be at least ${this.MIN_LENGTH} character long (after trimming).`);
    }
    if (trimmedText.length > this.MAX_LENGTH) {
      throw new ValueError(`Annotation text must be no more than ${this.MAX_LENGTH} characters long (after trimming).`);
    }
  }

  public value(): string {
    return this.props.value;
  }

  // equals is inherited from AbstractValueObject
}
