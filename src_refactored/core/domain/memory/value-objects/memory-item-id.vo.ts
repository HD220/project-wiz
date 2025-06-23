// src_refactored/core/domain/memory/value-objects/memory-item-id.vo.ts
import { Identity } from '../../../common/value-objects/identity.vo'; // Corrected path

export class MemoryItemId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): MemoryItemId {
    return new MemoryItemId(super.generate().value());
  }

  public static fromString(value: string): MemoryItemId {
    return new MemoryItemId(value);
  }
}
