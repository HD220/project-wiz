// src_refactored/core/domain/job/value-objects/backoff-type.vo.ts
import { z } from 'zod';
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/common/errors';
import { BackoffStrategyType } from './backoff-strategy-type.enum';
import { IBackoffStrategy } from '../ports/i-backoff-strategy.interface';
import { DelayMillisecondsVO } from './delay-milliseconds.vo';
import { AttemptCountVO } from './attempt-count.vo'; // Needed for stubbing strategy

// --- Temporary Stubs for Concrete Strategies ---
class ExponentialBackoffStrategy implements IBackoffStrategy {
  constructor(baseDelay: DelayMillisecondsVO, maxDelay?: DelayMillisecondsVO, multiplier?: number) {}
  calculate(baseDelay: DelayMillisecondsVO, attempts: AttemptCountVO, maxDelay?: DelayMillisecondsVO): DelayMillisecondsVO {
    return DelayMillisecondsVO.zero(); // Stub
  }
}
class LinearBackoffStrategy implements IBackoffStrategy {
  calculate(baseDelay: DelayMillisecondsVO, attempts: AttemptCountVO, maxDelay?: DelayMillisecondsVO): DelayMillisecondsVO {
    return DelayMillisecondsVO.zero(); // Stub
  }
}
class FixedBackoffStrategy implements IBackoffStrategy {
  calculate(baseDelay: DelayMillisecondsVO, attempts: AttemptCountVO, maxDelay?: DelayMillisecondsVO): DelayMillisecondsVO {
    return DelayMillisecondsVO.zero(); // Stub
  }
}
// --- End Temporary Stubs ---


const backoffTypeSchema = z.nativeEnum(BackoffStrategyType);

export interface BackoffTypeProps extends ValueObjectProps {
  value: BackoffStrategyType;
}

export class BackoffTypeVO extends AbstractValueObject<BackoffTypeProps> {
  private constructor(props: BackoffTypeProps) {
    super(props);
  }

  public static create(type: BackoffStrategyType): BackoffTypeVO {
    try {
      backoffTypeSchema.parse(type);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid backoff type: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e;
    }
    return new BackoffTypeVO({ value: type });
  }

  public get value(): BackoffStrategyType {
    return this.props.value;
  }

  /**
   * Gets an instance of the configured backoff strategy.
   * The RetryPolicyVO will typically call this and pass the necessary parameters.
   */
  public getStrategy(
    baseDelay: DelayMillisecondsVO,
    maxDelay?: DelayMillisecondsVO,
    multiplier?: number // Specific to exponential
  ): IBackoffStrategy {
    switch (this.props.value) {
      case BackoffStrategyType.EXPONENTIAL:
        return new ExponentialBackoffStrategy(baseDelay, maxDelay, multiplier);
      case BackoffStrategyType.LINEAR:
        // Linear and Fixed strategies might not store these if they are passed to calculate()
        return new LinearBackoffStrategy();
      case BackoffStrategyType.FIXED:
        return new FixedBackoffStrategy();
      default:
        // Should be caught by schema validation, but as a safeguard:
        throw new Error(`Unknown backoff strategy type: ${this.props.value}`);
    }
  }
}
