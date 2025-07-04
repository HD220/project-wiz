// src_refactored/core/domain/job/utils/calculate-backoff.ts

import { BackoffOptions, BackoffType } from '../value-objects/job-options.vo';

/**
 * Calculates the backoff delay for a job attempt.
 * @param attempt The current attempt number (1-indexed).
 * @param strategy The backoff strategy (type or options object).
 * @param isForStalled If true, indicates the backoff is for a stalled job, which might influence default delays.
 * @returns The calculated delay in milliseconds.
 */
export function calculateBackoff(
  attempt: number,
  strategy?: BackoffOptions | BackoffType,
  isForStalled: boolean = false,
): number {
  if (!strategy) return 0;

  const options: IJobBackoffOptions =
    typeof strategy === 'string' ? { type: strategy } : strategy;

  // Stalled jobs might have a different default base delay or handling if not specified
  const defaultBaseDelay = isForStalled ? (options.delay ?? 5000) : (options.delay ?? 1000);

  switch (options.type) {
    case 'exponential': {
      // For exponential, ensure attempt is at least 1.
      // The formula baseDelay * 2^(attempt-1) means:
      // attempt 1: baseDelay * 1
      // attempt 2: baseDelay * 2
      // attempt 3: baseDelay * 4
      // ...
      const exponentialDelay = defaultBaseDelay * Math.pow(2, Math.max(0, attempt - 1));
      return Math.min(exponentialDelay, options.maxDelay || Infinity);
    }
    case 'fixed':
      return defaultBaseDelay;

    // Example: Linear backoff could be an option too
    // case 'linear':
    //   return Math.min(defaultBaseDelay * attempt, options.maxDelay || Infinity);

    default:
      return 0;
  }
}
