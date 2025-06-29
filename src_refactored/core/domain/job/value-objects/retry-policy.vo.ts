// src_refactored/core/domain/job/value-objects/retry-policy.vo.ts
import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors'; // Corrected alias path

import { IBackoffStrategy } from '../ports/i-backoff-strategy.interface';
import { IRetryPolicy } from '../ports/i-retry-policy.interface';

import { AttemptCountVO } from './attempt-count.vo';
import { BackoffStrategyType } from './backoff-strategy-type.enum';
import { BackoffTypeVO } from './backoff-type.vo';
import { DelayMillisecondsVO } from './delay-milliseconds.vo';
import { MaxAttemptsVO } from './max-attempts.vo';


export const retryPolicyParamsSchema = z.object({
  maxAttempts: z.number().int().positive().default(3),
  delayBetweenAttemptsMs: z.number().int().nonnegative().default(1000), // Changed name for clarity
  backoffType: z.nativeEnum(BackoffStrategyType).default(BackoffStrategyType.EXPONENTIAL),
  maxDelayMs: z.number().int().nonnegative().optional(), // Changed name for clarity
  exponentialMultiplier: z.number().positive().optional(),
});

export type RetryPolicyParams = z.input<typeof retryPolicyParamsSchema>;
export type ValidatedRetryPolicyParams = z.output<typeof retryPolicyParamsSchema>;

export interface RetryPolicyProps extends ValueObjectProps {
  maxAttempts: MaxAttemptsVO;
  delayBetweenAttempts: DelayMillisecondsVO;
  backoffType: BackoffTypeVO;
  maxDelay?: DelayMillisecondsVO;
  exponentialMultiplier?: number; // Specific to exponential, might be better in strategy config
}

export class RetryPolicyVO extends AbstractValueObject<RetryPolicyProps> implements IRetryPolicy {
  private readonly strategy: IBackoffStrategy;

  private constructor(props: RetryPolicyProps) {
    super(props);
    this.strategy = this.props.backoffType.getStrategy(
      this.props.delayBetweenAttempts,
      this.props.maxDelay,
      this.props.exponentialMultiplier
    );
  }

  public static create(params: RetryPolicyParams = {}): RetryPolicyVO {
    let validatedParams: ValidatedRetryPolicyParams;
    try {
      validatedParams = retryPolicyParamsSchema.parse(params);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new ValueError(`Invalid retry policy parameters: ${e.errors.map(err => err.message).join(', ')}`);
      }
      throw e;
    }

    const props: RetryPolicyProps = {
      maxAttempts: MaxAttemptsVO.create(validatedParams.maxAttempts),
      delayBetweenAttempts: DelayMillisecondsVO.create(validatedParams.delayBetweenAttemptsMs),
      backoffType: BackoffTypeVO.create(validatedParams.backoffType),
      maxDelay: validatedParams.maxDelayMs !== undefined ? DelayMillisecondsVO.create(validatedParams.maxDelayMs) : undefined,
      exponentialMultiplier: validatedParams.exponentialMultiplier,
    };
    return new RetryPolicyVO(props);
  }

  public calculateDelay(attempts: AttemptCountVO): DelayMillisecondsVO {
    if (!this.shouldRetry(attempts)) {
      return DelayMillisecondsVO.zero();
    }
    return this.strategy.calculate(
      this.props.delayBetweenAttempts,
      attempts,
      this.props.maxDelay
    );
  }

  public shouldRetry(attempts: AttemptCountVO): boolean {
    return attempts.value < this.props.maxAttempts.value;
  }

  // Getters for individual VOs
  public get maxAttempts(): MaxAttemptsVO { return this.props.maxAttempts; }
  public get delayBetweenAttempts(): DelayMillisecondsVO { return this.props.delayBetweenAttempts; }
  public get backoffType(): BackoffTypeVO { return this.props.backoffType; }
  public get maxDelay(): DelayMillisecondsVO | undefined { return this.props.maxDelay; }
  public get exponentialMultiplier(): number | undefined { return this.props.exponentialMultiplier; }
}
