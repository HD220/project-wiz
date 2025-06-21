import { IRetryPolicy } from './retry-policy.interface';
import { AttemptCount } from './attempt-count.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';

export class NoRetryPolicy implements IRetryPolicy {
  // No constructor parameters needed as it represents a fixed policy of no retries.

  public static create(): NoRetryPolicy {
    return new NoRetryPolicy();
  }

  public calculateDelay(attempts: AttemptCount): DelayMilliseconds {
    // Suppress unused parameter warning if your linter is strict
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unusedAttempts = attempts;
    return DelayMilliseconds.zero();
  }

  public shouldRetry(attempts: AttemptCount): boolean {
    // Suppress unused parameter warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _unusedAttempts = attempts;
    return false; // Never retry
  }
}
