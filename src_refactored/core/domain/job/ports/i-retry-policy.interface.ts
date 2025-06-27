// src_refactored/core/domain/job/ports/i-retry-policy.interface.ts
import { AttemptCountVO } from '../value-objects/attempt-count.vo';
import { DelayMillisecondsVO } from '../value-objects/delay-milliseconds.vo';

export interface IRetryPolicy {
  /**
   * Calculates the delay for the next retry attempt.
   * @param attempts The current number of attempts made so far (as a Value Object).
   * @returns The calculated delay in milliseconds (as a Value Object), or zero if no retry should occur.
   */
  calculateDelay(attempts: AttemptCountVO): DelayMillisecondsVO;

  /**
   * Checks if another retry attempt should be made.
   * @param attempts The current number of attempts made so far (as a Value Object).
   * @returns True if another attempt should be made, false otherwise.
   */
  shouldRetry(attempts: AttemptCountVO): boolean;
}
