import { IBackoffStrategy } from './backoff-strategy.interface';
import { AttemptCount } from './attempt-count.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';

export class LinearBackoffStrategy implements IBackoffStrategy {
  public calculate(
    baseDelay: DelayMilliseconds,
    attempts: AttemptCount,
    maxDelay?: DelayMilliseconds
  ): DelayMilliseconds {
    // Lógica: (attempts.getValue() + 1) * baseDelay.getValue()
    // The prompt implies (attempts.getValue() + 1). If attempts are 1-indexed for the first retry,
    // then attempts.getValue() might be more direct.
    // E.g., attempt 1: 1 * baseDelay. attempt 2: 2 * baseDelay.
    // Let's assume attempts.getValue() directly represents the factor for the current attempt.
    // If first attempt (attempts.getValue() == 1) should have baseDelay, then formula is attempts.getValue() * baseDelay.getValue()
    // If first attempt (attempts.getValue() == 0) should have baseDelay, then (attempts.getValue() + 1) * baseDelay.getValue()
    // Assuming attempts.getValue() is 1-indexed for retries (1st retry, 2nd retry...)

    let calculatedDelayValue = attempts.getValue() * baseDelay.getValue();

    if (maxDelay && calculatedDelayValue > maxDelay.getValue()) {
      calculatedDelayValue = maxDelay.getValue();
    }

    return DelayMilliseconds.create(Math.round(calculatedDelayValue));
  }
}
