import { z } from 'zod';
import { AttemptCount } from './attempt-count.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';

// Define Zod schema for validation if needed, though DelayMilliseconds already validates.
// For example, ensure baseDelay is positive if that's a rule.
// const exponentialBackoffSchema = z.object({
//   baseDelay: z.instanceof(DelayMilliseconds), // Or more specific validation
//   maxDelay: z.instanceof(DelayMilliseconds).optional(),
//   multiplier: z.number().positive().default(2)
// });

export class ExponentialBackoff {
  // Default multiplier for exponential backoff
  private static readonly DEFAULT_MULTIPLIER = 2;
  private readonly multiplier: number;

  constructor(
    private readonly baseDelay: DelayMilliseconds,
    private readonly maxDelay?: DelayMilliseconds,
    multiplier?: number
  ) {
    // Validate inputs - VOs already validate themselves.
    // We might add cross-VO validation here if necessary (e.g., maxDelay >= baseDelay)
    if (multiplier !== undefined && multiplier <= 0) {
      throw new Error("Multiplier must be positive.");
    }
    this.multiplier = multiplier || ExponentialBackoff.DEFAULT_MULTIPLIER;
  }

  public static create(
    baseDelay: DelayMilliseconds,
    maxDelay?: DelayMilliseconds,
    multiplier?: number
  ): ExponentialBackoff {
    return new ExponentialBackoff(baseDelay, maxDelay, multiplier);
  }

  public calculateDelay(attempts: AttemptCount): DelayMilliseconds {
    if (attempts.getValue() <= 0) { // First attempt (attempt 0 or 1 depending on convention) might not apply backoff
      return DelayMilliseconds.zero(); // Or return baseDelay, depending on desired behavior for 0/1 attempts
    }

    // The formula often uses (attempts - 1) if attempt 1 has baseDelay.
    // If attempt 0 is the first, then attempts.getValue() is fine.
    // Assuming attempts.getValue() is 1 for the first retry.
    const calculatedValue =
      this.baseDelay.getValue() *
      Math.pow(this.multiplier, attempts.getValue() -1 ); // attempts are 1-indexed for this formula

    let delayValue = Math.round(calculatedValue);

    if (this.maxDelay && delayValue > this.maxDelay.getValue()) {
      delayValue = this.maxDelay.getValue();
    }

    return DelayMilliseconds.create(delayValue);
  }

  public getBaseDelay(): DelayMilliseconds {
    return this.baseDelay;
  }

  public getMaxDelay(): DelayMilliseconds | undefined {
    return this.maxDelay;
  }

  public getMultiplier(): number {
    return this.multiplier;
  }
}
