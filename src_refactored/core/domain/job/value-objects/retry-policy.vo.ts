// src_refactored/core/domain/job/value-objects/retry-policy.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';
import { MaxAttempts, AttemptCount } from './attempt-count.vo';

export enum BackoffType {
  EXPONENTIAL = 'EXPONENTIAL',
  FIXED = 'FIXED',
  // LINEAR = 'LINEAR', // Could be added
}

interface RetryDelayProps extends ValueObjectProps {
  value: number; // milliseconds
}
export class RetryDelay extends AbstractValueObject<RetryDelayProps> {
    private constructor(value: number) {
        if (value < 0) throw new Error("Retry delay cannot be negative.");
        super({ value });
    }
    public static fromMilliseconds(ms: number): RetryDelay {
        return new RetryDelay(ms);
    }
    public value(): number { return this.props.value; }
}


interface RetryPolicyProps extends ValueObjectProps {
  maxAttempts: MaxAttempts;
  backoffType: BackoffType;
  initialDelay: RetryDelay; // Initial delay for exponential/linear, or fixed delay
  maxDelay?: RetryDelay;     // Max delay for exponential backoff
}

export class RetryPolicy extends AbstractValueObject<RetryPolicyProps> {
  private constructor(props: RetryPolicyProps) {
    super(props);
  }

  public static create(props: {
    maxAttempts: MaxAttempts;
    backoffType: BackoffType;
    initialDelayMs: number;
    maxDelayMs?: number;
  }): RetryPolicy {
    if (!props.maxAttempts) throw new Error("Max attempts must be provided for RetryPolicy.");
    if (!props.backoffType) throw new Error("Backoff type must be provided for RetryPolicy.");
    if (props.initialDelayMs === undefined || props.initialDelayMs < 0) {
      throw new Error("Initial delay (ms) must be a non-negative number.");
    }
    if (props.maxDelayMs !== undefined && props.maxDelayMs < props.initialDelayMs) {
      throw new Error("Max delay cannot be less than initial delay.");
    }

    return new RetryPolicy({
      maxAttempts: props.maxAttempts,
      backoffType: props.backoffType,
      initialDelay: RetryDelay.fromMilliseconds(props.initialDelayMs),
      maxDelay: props.maxDelayMs !== undefined ? RetryDelay.fromMilliseconds(props.maxDelayMs) : undefined,
    });
  }

  public static defaultFixed(maxAttempts: number = 3, fixedDelayMs: number = 1000): RetryPolicy {
    return new RetryPolicy({
      maxAttempts: MaxAttempts.create(maxAttempts),
      backoffType: BackoffType.FIXED,
      initialDelay: RetryDelay.fromMilliseconds(fixedDelayMs),
    });
  }

  public static defaultExponential(maxAttempts: number = 5, initialDelayMs: number = 1000, maxDelayMs: number = 30000): RetryPolicy {
    return new RetryPolicy({
      maxAttempts: MaxAttempts.create(maxAttempts),
      backoffType: BackoffType.EXPONENTIAL,
      initialDelay: RetryDelay.fromMilliseconds(initialDelayMs),
      maxDelay: RetryDelay.fromMilliseconds(maxDelayMs),
    });
  }

  public maxAttempts(): MaxAttempts {
    return this.props.maxAttempts;
  }

  public calculateNextDelay(attemptCount: AttemptCount): RetryDelay {
    if (!this.props.maxAttempts.allowsMoreAttempts(attemptCount)) {
      return RetryDelay.fromMilliseconds(0); // No more retries, no delay
    }

    const currentAttempt = attemptCount.value(); // 0-indexed for calculation if first attempt is 0

    if (this.props.backoffType === BackoffType.FIXED) {
      return this.props.initialDelay;
    }

    if (this.props.backoffType === BackoffType.EXPONENTIAL) {
      // Factor can be 2 or other, using 2 for typical exponential backoff
      // Math.pow(factor, attemptNumber) * initialDelay
      // currentAttempt is 0 for the first failure (meaning 1st actual attempt failed, this is for the 2nd attempt)
      const delayMs = Math.pow(2, currentAttempt) * this.props.initialDelay.value();
      if (this.props.maxDelay && delayMs > this.props.maxDelay.value()) {
        return this.props.maxDelay;
      }
      return RetryDelay.fromMilliseconds(delayMs);
    }

    // Default or unknown backoff, return initial delay
    return this.props.initialDelay;
  }
}

// NoRetryPolicy as a specific type of RetryPolicy for clarity
export class NoRetryPolicy extends RetryPolicy {
    private constructor() {
        super({
            maxAttempts: MaxAttempts.create(1), // Only 1 attempt means no retries
            backoffType: BackoffType.FIXED,    // Irrelevant as no retries
            initialDelay: RetryDelay.fromMilliseconds(0) // Irrelevant
        });
    }

    public static create(): NoRetryPolicy {
        return new NoRetryPolicy();
    }

    // Override calculateNextDelay for clarity, though parent would also return 0
    public calculateNextDelay(_attemptCount: AttemptCount): RetryDelay {
        return RetryDelay.fromMilliseconds(0); // No delay as no retries
    }
}
