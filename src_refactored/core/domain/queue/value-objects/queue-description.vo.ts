// src_refactored/core/domain/queue/value-objects/queue-description.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors';

interface QueueDescriptionProps extends ValueObjectProps {
  value: string | null; // Description can be optional
}

export class QueueDescription extends AbstractValueObject<QueueDescriptionProps> {
  private static readonly MAX_LENGTH = 255; // Arbitrary max length

  private constructor(props: QueueDescriptionProps) {
    super(props);
  }

  public static create(description: string | null | undefined): QueueDescription {
    if (description === null || description === undefined || description.trim() === '') {
      return new QueueDescription({ value: null });
    }
    this.validate(description);
    // Store trimmed version if not null
    return new QueueDescription({ value: description.trim() });
  }

  private static validate(description: string): void {
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > this.MAX_LENGTH) {
      throw new ValueError(`Queue description must be no more than ${this.MAX_LENGTH} characters long.`);
    }
  }

  public value(): string | null {
    return this.props.value;
  }
}
