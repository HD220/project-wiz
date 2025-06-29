// src_refactored/core/domain/job/value-objects/exponential-backoff.vo.ts
import { z } from 'zod';

import { ValueError } from '@/domain/common/errors'; // Corrected alias path

import { AttemptCountVO } from './attempt-count.vo';
import { DelayMillisecondsVO } from './delay-milliseconds.vo';

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
      } catch (error) { // Renamed e to error
        if (error instanceof z.ZodError) {
          throw new ValueError(`Invalid multiplier: ${error.errors.map(err => err.message).join(', ')}`);
        }
        throw error; // Re-throw error
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
}
