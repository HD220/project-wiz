import { z } from "zod";

export const BackoffType = {
  EXPONENTIAL: "exponential",
  LINEAR: "linear",
  FIXED: "fixed",
} as const;

const retryPolicySchema = z.object({
  maxAttempts: z.number().int().positive().default(3),
  delayBetweenAttempts: z.number().int().nonnegative().default(1000),
  backoffType: z.nativeEnum(BackoffType).default(BackoffType.EXPONENTIAL),
  maxDelay: z.number().int().nonnegative().optional(),
});

export type RetryPolicyValue = z.infer<typeof retryPolicySchema>;

abstract class BackoffCalculator {
  constructor(protected readonly baseDelay: number) {}

  abstract calculate(attempts: number): number;
}

class ExponentialBackoff extends BackoffCalculator {
  calculate(attempts: number): number {
    return (attempts + 1) ** 2 * this.baseDelay;
  }
}

class LinearBackoff extends BackoffCalculator {
  calculate(attempts: number): number {
    return (attempts + 1) * this.baseDelay;
  }
}

class FixedBackoff extends BackoffCalculator {
  calculate(): number {
    return this.baseDelay;
  }
}

export class RetryPolicy {
  private readonly policy: RetryPolicyValue;
  private readonly backoffCalculator: BackoffCalculator;

  constructor(policy: Partial<RetryPolicyValue> = {}) {
    this.policy = retryPolicySchema.parse(policy);
    this.backoffCalculator = this.createBackoffCalculator();
  }

  private createBackoffCalculator(): BackoffCalculator {
    const { delayBetweenAttempts, backoffType } = this.policy;

    switch (backoffType) {
      case BackoffType.EXPONENTIAL:
        return new ExponentialBackoff(delayBetweenAttempts);
      case BackoffType.LINEAR:
        return new LinearBackoff(delayBetweenAttempts);
      case BackoffType.FIXED:
        return new FixedBackoff(delayBetweenAttempts);
      default:
        return new FixedBackoff(delayBetweenAttempts);
    }
  }

  get value(): RetryPolicyValue {
    return this.policy;
  }

  calculateDelay(attempts: number): number {
    const { maxDelay } = this.policy;
    const delay = this.backoffCalculator.calculate(attempts);
    return maxDelay ? Math.min(delay, maxDelay) : delay;
  }
}
