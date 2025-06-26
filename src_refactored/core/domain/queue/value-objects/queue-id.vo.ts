// src_refactored/core/domain/queue/value-objects/queue-id.vo.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

export class QueueId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): QueueId {
    return new QueueId(super.generate().value());
  }

  public static fromString(value: string): QueueId {
    return new QueueId(value);
  }
}
