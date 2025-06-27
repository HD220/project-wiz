// src_refactored/core/domain/job/strategies/fixed-backoff.strategy.ts
import { IBackoffStrategy } from '../ports/i-backoff-strategy.interface';
import { AttemptCountVO } from '../value-objects/attempt-count.vo';
import { DelayMillisecondsVO } from '../value-objects/delay-milliseconds.vo';

export class FixedBackoffStrategy implements IBackoffStrategy {
  public calculate(
    baseDelay: DelayMillisecondsVO,
    _attempts: AttemptCountVO, // Not used in fixed strategy logic for calculation itself
    maxDelay?: DelayMillisecondsVO
  ): DelayMillisecondsVO {
    let delayValue = baseDelay.value;

    if (maxDelay && delayValue > maxDelay.value) {
      delayValue = maxDelay.value;
    }
    return DelayMillisecondsVO.create(delayValue);
  }
}
