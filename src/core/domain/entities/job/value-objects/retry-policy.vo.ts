import { z } from 'zod';
import { AttemptCount } from './attempt-count.vo';
import { MaxAttempts } from './max-attempts.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';
import { BackoffTypeVO, BackoffStrategyType } from './backoff-type.vo';
import { IRetryPolicy } from './retry-policy.interface';
import { IBackoffStrategy } from './backoff-strategy.interface';

// Parameters for constructor - uses primitives and string enum for flexibility
export const retryPolicyParamsSchema = z.object({
  maxAttempts: z.number().int().positive().default(3),
  delayBetweenAttempts: z.number().int().nonnegative().default(1000),
  backoffType: z.nativeEnum(BackoffStrategyType).default(BackoffStrategyType.EXPONENTIAL),
  maxDelay: z.number().int().nonnegative().optional(),
  // multiplier for exponential, could be added here if desired for constructor flexibility
  exponentialMultiplier: z.number().positive().optional(),
});

export type RetryPolicyParams = z.input<typeof retryPolicyParamsSchema>; // Allows partial input due to defaults
export type ValidatedRetryPolicyParams = z.output<typeof retryPolicyParamsSchema>; // All fields present due to defaults

// Internal properties will use Value Objects
interface RetryPolicyProps {
  maxAttempts: MaxAttempts;
  delayBetweenAttempts: DelayMilliseconds;
  backoffType: BackoffTypeVO;
  maxDelay?: DelayMilliseconds;
  // This is specific to exponential and could be part of ExponentialBackoffStrategy's own config
  // or passed via BackoffTypeVO.getStrategy if that method is enhanced.
  // For now, storing it if provided, to be used by getStrategy.
  exponentialMultiplier?: number;
}

export class RetryPolicy implements IRetryPolicy {
  private readonly props: RetryPolicyProps;
  private readonly strategy: IBackoffStrategy;

  constructor(params: RetryPolicyParams = {}) {
    const validatedParams: ValidatedRetryPolicyParams = retryPolicyParamsSchema.parse(params);

    this.props = {
      maxAttempts: MaxAttempts.create(validatedParams.maxAttempts),
      delayBetweenAttempts: DelayMilliseconds.create(validatedParams.delayBetweenAttempts),
      backoffType: BackoffTypeVO.create(validatedParams.backoffType),
      maxDelay: validatedParams.maxDelay !== undefined ? DelayMilliseconds.create(validatedParams.maxDelay) : undefined,
      exponentialMultiplier: validatedParams.exponentialMultiplier,
    };

    // Get the strategy instance from the BackoffTypeVO
    // The getStrategy method in BackoffTypeVO needs to accept these parameters
    this.strategy = this.props.backoffType.getStrategy(
      this.props.delayBetweenAttempts,
      this.props.maxDelay,
      this.props.exponentialMultiplier
    );
  }

  public static create(params: RetryPolicyParams = {}): RetryPolicy {
    return new RetryPolicy(params);
  }

  public calculateDelay(attempts: AttemptCount): DelayMilliseconds {
    if (!this.shouldRetry(attempts)) {
      return DelayMilliseconds.zero(); // Or throw error, depending on desired contract
    }
    // The strategy itself should now handle the maxDelay logic internally.
    return this.strategy.calculate(
      this.props.delayBetweenAttempts, // Base delay for the strategy
      attempts,
      this.props.maxDelay // Max delay for the strategy to cap
    );
  }

  public shouldRetry(attempts: AttemptCount): boolean {
    return attempts.getValue() < this.props.maxAttempts.getValue();
  }

  // Getters for individual VOs if needed, though not explicitly requested to be removed/kept.
  // Example:
  public getMaxAttempts(): MaxAttempts {
    return this.props.maxAttempts;
  }

  public getDelayBetweenAttempts(): DelayMilliseconds {
    return this.props.delayBetweenAttempts;
  }

  public getBackoffType(): BackoffTypeVO {
    return this.props.backoffType;
  }

  public getMaxDelay(): DelayMilliseconds | undefined {
    return this.props.maxDelay;
  }
}
