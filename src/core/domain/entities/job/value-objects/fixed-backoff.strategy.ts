import { IBackoffStrategy } from './backoff-strategy.interface';
import { AttemptCount } from './attempt-count.vo'; // Imported for interface compliance, though not used directly in this logic
import { DelayMilliseconds } from './delay-milliseconds.vo';

export class FixedBackoffStrategy implements IBackoffStrategy {
  public calculate(
    baseDelay: DelayMilliseconds,
    attempts: AttemptCount, // Not used in fixed strategy logic for calculation itself
    maxDelay?: DelayMilliseconds
  ): DelayMilliseconds {
    // Lógica: Retorna baseDelay, mas respeita maxDelay.
    // If maxDelay is defined and baseDelay is greater than maxDelay, then maxDelay should be returned.
    // This means "fixed" is fixed at baseDelay, unless baseDelay itself exceeds maxDelay.

    let delayValue = baseDelay.getValue();

    if (maxDelay && delayValue > maxDelay.getValue()) {
      delayValue = maxDelay.getValue();
    }
    // Also, it's possible that fixed delay should simply be baseDelay, and if a maxDelay is
    // specified, it should be capped at that. This is the interpretation below.
    // Example: base=5000, max=10000 -> result 5000
    // Example: base=15000, max=10000 -> result 10000

    return DelayMilliseconds.create(delayValue);
  }
}
