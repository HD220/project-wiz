// src_refactored/core/domain/job/strategies/linear-backoff.strategy.ts
import { IBackoffStrategy } from '../ports/i-backoff-strategy.interface';
import { AttemptCountVO } from '../value-objects/attempt-count.vo';
import { DelayMillisecondsVO } from '../value-objects/delay-milliseconds.vo';

export class LinearBackoffStrategy implements IBackoffStrategy {
  public calculate(
    baseDelay: DelayMillisecondsVO,
    attempts: AttemptCountVO, // Assumed to be 1-indexed for retries
    maxDelay?: DelayMillisecondsVO
  ): DelayMillisecondsVO {
    // If attempts.value is 0 for the first try, and 1 for the first retry,
    // then for the Nth retry (attempts.value = N), delay is N * baseDelay.
    // If the first actual execution is attempt 1, and first retry is attempt 2,
    // then (attempts.value - 1) * baseDelay might be used if no delay for first attempt.
    // For simplicity, let's assume attempts.value is the multiplier for the current retry.
    // So, for the 1st retry (attempts.value = 1), delay is 1 * baseDelay.
    // For the 2nd retry (attempts.value = 2), delay is 2 * baseDelay.
    if (attempts.value <= 0) { // Should not happen if attempts is for retries
        return DelayMillisecondsVO.zero();
    }

    let calculatedDelayValue = attempts.value * baseDelay.value;

    if (maxDelay && calculatedDelayValue > maxDelay.value) {
      calculatedDelayValue = maxDelay.value;
    }

    return DelayMillisecondsVO.create(Math.round(calculatedDelayValue));
  }
}
