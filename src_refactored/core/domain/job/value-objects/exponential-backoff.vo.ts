// src_refactored/core/domain/job/value-objects/exponential-backoff.vo.ts
import { z } from 'zod';
import { AttemptCountVO } from './attempt-count.vo';
import { DelayMillisecondsVO } from './delay-milliseconds.vo';
import { ValueError } from '@/core/common/errors';

const multiplierSchema = z.number().positive({ message: "Multiplier must be a positive number." });

export class ExponentialBackoffVO {
  private static readonly DEFAULT_MULTIPLIER = 2;
  public readonly baseDelay: DelayMillisecondsVO;
  public readonly maxDelay?: DelayMillisecondsVO;
  public readonly multiplier: number;

  private constructor(
    baseDelay: DelayMillisecondsVO,
    maxDelay?: DelayMillisecondsVO,
    multiplier?: number
  ) {
    if (!baseDelay) throw new ValueError("Base delay is required for ExponentialBackoffVO.");

    if (multiplier !== undefined) {
      try {
        multiplierSchema.parse(multiplier);
      } catch (e) {
        if (e instanceof z.ZodError) {
          throw new ValueError(`Invalid multiplier: ${e.errors.map(err => err.message).join(', ')}`);
        }
        throw e;
      }
    }
    if (maxDelay && baseDelay.value > maxDelay.value) {
        throw new ValueError('Base delay cannot be greater than max delay.');
    }

    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.multiplier = multiplier || ExponentialBackoffVO.DEFAULT_MULTIPLIER;
  }

  public static create(
    baseDelay: DelayMillisecondsVO,
    maxDelay?: DelayMillisecondsVO,
    multiplier?: number
  ): ExponentialBackoffVO {
    return new ExponentialBackoffVO(baseDelay, maxDelay, multiplier);
  }

  public calculateDelay(attempts: AttemptCountVO): DelayMillisecondsVO {
    if (attempts.value <= 0) {
      return DelayMillisecondsVO.zero();
    }

    // attempts are 1-indexed for this formula (1st retry is attempt 1)
    const calculatedValue =
      this.baseDelay.value *
      Math.pow(this.multiplier, attempts.value - 1);

    let delayValue = Math.round(calculatedValue);

    if (this.maxDelay && delayValue > this.maxDelay.value) {
      delayValue = this.maxDelay.value;
    }

    return DelayMillisecondsVO.create(delayValue);
  }

  // No .equals method as this VO has behavior and identity might matter if we cache instances,
  // or it's simply used as a calculator. If value-based equality is needed,
  // an explicit .equals could be added comparing all properties.
  // For now, it acts more as a configured calculator/strategy parameters holder.
}
