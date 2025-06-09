import { z } from "zod";
import { ExponentialBackoff } from "./exponential-backoff.vo";

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

export class RetryPolicy {
  private readonly policy: RetryPolicyValue;

  constructor(policy: Partial<RetryPolicyValue> = {}) {
    this.policy = retryPolicySchema.parse(policy);
  }

  get value(): RetryPolicyValue {
    return this.policy;
  }

  calculateDelay(attempts: number): number {
    const { delayBetweenAttempts, backoffType, maxDelay } = this.policy;
    let delay: number;

    switch (backoffType) {
      case BackoffType.EXPONENTIAL: {
        const exponentialBackoff = new ExponentialBackoff(
          delayBetweenAttempts,
          maxDelay
        );
        delay = exponentialBackoff.calculateDelay(attempts);
        break;
      }
      case BackoffType.LINEAR:
        delay = (attempts + 1) * delayBetweenAttempts;
        break;
      case BackoffType.FIXED:
        delay = delayBetweenAttempts;
        break;
      default:
        delay = delayBetweenAttempts;
    }

    return maxDelay ? Math.min(delay, maxDelay) : delay;
  }
}
