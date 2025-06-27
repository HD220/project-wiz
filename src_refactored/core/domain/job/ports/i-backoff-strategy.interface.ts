// src_refactored/core/domain/job/ports/i-backoff-strategy.interface.ts
import { AttemptCountVO } from '../value-objects/attempt-count.vo';
import { DelayMillisecondsVO } from '../value-objects/delay-milliseconds.vo';

export interface IBackoffStrategy {
  /**
   * Calculates the delay for the next retry attempt.
   * @param baseDelay The initial or base delay configured for the retry policy.
   * @param attempts The current number of attempts made (as a Value Object).
   * @param maxDelay An optional maximum delay to cap the calculated backoff.
   * @returns The calculated delay in milliseconds (as a Value Object).
   */
  calculate(
    baseDelay: DelayMillisecondsVO,
    attempts: AttemptCountVO,
    maxDelay?: DelayMillisecondsVO
  ): DelayMillisecondsVO;
}
