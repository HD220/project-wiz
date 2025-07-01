import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

import { ValueError } from "@/domain/common/errors";

interface MemoryItemContentProps extends ValueObjectProps {
  value: string;
}

export class MemoryItemContent extends AbstractValueObject<MemoryItemContentProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 10000;

  private constructor(props: MemoryItemContentProps) {
    super(props);
  }

  public static create(content: string): MemoryItemContent {
    this.validate(content);
    return new MemoryItemContent({ value: content });
  }

  private static validate(content: string): void {
    if (content === null || content === undefined) {
      throw new ValueError("Memory item content cannot be null or undefined.");
    }
    const trimmedContent = content.trim();
    if (trimmedContent.length < this.MIN_LENGTH) {
      throw new ValueError(
        `Memory item content must be at least ${this.MIN_LENGTH} character long (after trimming).`
      );
    }
    if (trimmedContent.length > this.MAX_LENGTH) {
      throw new ValueError(
        `Memory item content must be no more than ${this.MAX_LENGTH} characters long (after trimming).`
      );
    }
  }

  public value(): string {
    return this.props.value;
  }
}
