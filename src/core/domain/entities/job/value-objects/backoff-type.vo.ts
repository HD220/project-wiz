import { z } from 'zod';
import { IBackoffStrategy } from './backoff-strategy.interface';
import { ExponentialBackoffStrategy } from './exponential-backoff.strategy';
import { LinearBackoffStrategy } from './linear-backoff.strategy';
import { FixedBackoffStrategy } from './fixed-backoff.strategy';
import { DelayMilliseconds } from './delay-milliseconds.vo'; // Required for strategy constructors

// Define default parameters for strategies if needed, or expect them to be passed to RetryPolicy
const defaultBaseDelay = DelayMilliseconds.create(1000); // Example default

export enum BackoffStrategyType {
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  FIXED = 'fixed',
}

const backoffTypeSchema = z.nativeEnum(BackoffStrategyType);

export class BackoffTypeVO {
  private constructor(private readonly value: BackoffStrategyType) {
    backoffTypeSchema.parse(value);
  }

  public static create(type: BackoffStrategyType): BackoffTypeVO {
    return new BackoffTypeVO(type);
  }

  public getValue(): BackoffStrategyType {
    return this.value;
  }

  // The getStrategy method needs access to parameters like baseDelay, maxDelay, etc.
  // These parameters are typically part of the RetryPolicy itself.
  // This VO should probably not be responsible for instantiating strategies
  // with concrete values if those values come from the parent RetryPolicy.
  // Option 1: Pass parameters to getStrategy.
  // Option 2: The RetryPolicy constructs the strategy using this VO's value. (Preferred)

  // For now, let's assume Option 1 for directness as per prompt structure,
  // but ideally RetryPolicy would use this VO's value to pick and configure a strategy.
  public getStrategy(
    baseDelay: DelayMilliseconds, // These params make getStrategy a factory for configured strategies
    maxDelay?: DelayMilliseconds,
    multiplier?: number // Specific to exponential
  ): IBackoffStrategy {
    switch (this.value) {
      case BackoffStrategyType.EXPONENTIAL:
        return new ExponentialBackoffStrategy(baseDelay, maxDelay, multiplier);
      case BackoffStrategyType.LINEAR:
        return new LinearBackoffStrategy(); // Linear and Fixed don't store params internally
      case BackoffStrategyType.FIXED:
        return new FixedBackoffStrategy();   // They use params passed to calculate()
      default:
        throw new Error(`Unknown backoff strategy type: ${this.value}`);
    }
  }

  // Simpler version if RetryPolicy handles strategy instantiation and configuration:
  // public getStrategyType(): BackoffStrategyType {
  //   return this.value;
  // }

  public equals(other: BackoffTypeVO): boolean {
    return this.value === other.value;
  }
}
