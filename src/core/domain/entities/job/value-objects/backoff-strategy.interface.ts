import { AttemptCount } from './attempt-count.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';

export interface IBackoffStrategy {
  calculate(
    baseDelay: DelayMilliseconds,
    attempts: AttemptCount,
    maxDelay?: DelayMilliseconds
  ): DelayMilliseconds;
}
