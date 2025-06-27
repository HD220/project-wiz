// src_refactored/core/domain/queue/value-objects/queue-concurrency.vo.ts
import { ValueError } from '@/domain/common/errors';
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface QueueConcurrencyProps extends ValueObjectProps {
  value: number;
}

export class QueueConcurrency extends AbstractValueObject<QueueConcurrencyProps> {
  private static readonly MIN_VALUE = 1;
  private static readonly MAX_VALUE = 100; // Arbitrary practical max, can be adjusted

  private constructor(props: QueueConcurrencyProps) {
    super(props);
  }

  public static create(concurrency: number): QueueConcurrency {
    this.validate(concurrency);
    return new QueueConcurrency({ value: concurrency });
  }

  private static validate(concurrency: number): void {
    if (concurrency === null || concurrency === undefined) {
      throw new ValueError('Queue concurrency cannot be null or undefined.');
    }
    if (!Number.isInteger(concurrency)) {
      throw new ValueError('Queue concurrency must be an integer.');
    }
    if (concurrency < this.MIN_VALUE) {
      throw new ValueError(`Queue concurrency must be at least ${this.MIN_VALUE}.`);
    }
    if (concurrency > this.MAX_VALUE) {
      throw new ValueError(`Queue concurrency must be no more than ${this.MAX_VALUE}.`);
    }
  }

  public value(): number {
    return this.props.value;
  }
}
