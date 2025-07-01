import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

import { ValueError } from "@/domain/common/errors";

interface MemoryItemSourceProps extends ValueObjectProps {
  value: string | null;
}

export class MemoryItemSource extends AbstractValueObject<MemoryItemSourceProps> {
  private static readonly MAX_LENGTH = 100;

  private constructor(props: MemoryItemSourceProps) {
    super(props);
  }

  public static create(source: string | null | undefined): MemoryItemSource {
    if (source === null || source === undefined || source.trim() === "") {
      return new MemoryItemSource({ value: null });
    }
    this.validate(source);
    return new MemoryItemSource({ value: source.trim() });
  }

  private static validate(source: string): void {
    const trimmedSource = source.trim();
    if (trimmedSource.length > this.MAX_LENGTH) {
      throw new ValueError(
        `Memory item source must be no more than ${this.MAX_LENGTH} characters long.`
      );
    }
  }

  public value(): string | null {
    return this.props.value;
  }
}
