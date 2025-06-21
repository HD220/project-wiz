import { AttemptCount } from './attempt-count.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';

export interface IRetryPolicy {
  /**
   * Calculates the delay for the next retry attempt.
   * @param attempts The current number of attempts made so far.
   * @returns The calculated delay in milliseconds, or zero if no retry should occur.
   */
  calculateDelay(attempts: AttemptCount): DelayMilliseconds;

  /**
   * Checks if another retry attempt should be made.
   * @param attempts The current number of attempts made so far.
   * @returns True if another attempt should be made, false otherwise.
   */
  shouldRetry(attempts: AttemptCount): boolean;
}
