// src_refactored/core/domain/job/strategies/exponential-backoff.strategy.ts
import { IBackoffStrategy } from '../ports/i-backoff-strategy.interface';
import { AttemptCountVO } from '../value-objects/attempt-count.vo';
import { DelayMillisecondsVO } from '../value-objects/delay-milliseconds.vo';
import { ExponentialBackoffVO } from '../value-objects/exponential-backoff.vo';

export class ExponentialBackoffStrategy implements IBackoffStrategy {
  private readonly exponentialBackoffCalculator: ExponentialBackoffVO;

  constructor(
    baseDelay: DelayMillisecondsVO,
    maxDelay?: DelayMillisecondsVO,
    multiplier?: number
  ) {
    this.exponentialBackoffCalculator = ExponentialBackoffVO.create(
      baseDelay,
      maxDelay,
      multiplier
    );
  }

  public calculate(
    // baseDelay and maxDelay passed here are ignored in favor of the pre-configured calculator.
    // This is a design choice. If they should override, the logic here would change.
    _baseDelayIgnored: DelayMillisecondsVO,
    attempts: AttemptCountVO,
    _maxDelayIgnored?: DelayMillisecondsVO
  ): DelayMillisecondsVO {
    return this.exponentialBackoffCalculator.calculateDelay(attempts);
  }
}
