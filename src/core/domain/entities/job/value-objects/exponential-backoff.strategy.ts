import { IBackoffStrategy } from './backoff-strategy.interface';
import { AttemptCount } from './attempt-count.vo';
import { DelayMilliseconds } from './delay-milliseconds.vo';
import { ExponentialBackoff } from './exponential-backoff.vo'; // Assuming this VO holds the parameters

export class ExponentialBackoffStrategy implements IBackoffStrategy {
  private readonly exponentialBackoffCalculator: ExponentialBackoff;

  constructor(baseDelay: DelayMilliseconds, maxDelay?: DelayMilliseconds, multiplier?: number) {
    // The ExponentialBackoff VO itself now contains the calculation logic.
    // The strategy class primarily acts as an adapter to the IBackoffStrategy interface
    // and holds an instance of the calculator VO.
    this.exponentialBackoffCalculator = ExponentialBackoff.create(baseDelay, maxDelay, multiplier);
  }

  public calculate(
    baseDelay: DelayMilliseconds, // This parameter is somewhat redundant if calculator is pre-configured
    attempts: AttemptCount,
    maxDelay?: DelayMilliseconds // Also potentially redundant
  ): DelayMilliseconds {
    // If the strategy is to be configured on instantiation, then baseDelay and maxDelay here might be ignored
    // in favor of the ones used to create this.exponentialBackoffCalculator.
    // Or, the strategy could create a new ExponentialBackoff VO instance here using these params.
    // For now, let's assume it uses its configured exponentialBackoffCalculator,
    // which was initialized with its own baseDelay and maxDelay.
    // This means the baseDelay and maxDelay passed to this calculate method might be ignored by this specific strategy.
    // This is a design choice: is the strategy configured once, or reconfigured with each call?
    // Given the other strategies, it's more likely that baseDelay and maxDelay from calculate() are used.
    // Let's re-instantiate or use a static method if ExponentialBackoff is just a calculator.

    // Re-interpreting: The IBackoffStrategy interface implies baseDelay and maxDelay are passed at calculation time.
    // So, ExponentialBackoff VO should be a pure calculator, or we create it here.
    // The previous step made ExponentialBackoff VO store these.
    // Let's assume the ExponentialBackoff VO is used as a parameter store AND calculator.
    // If the baseDelay/maxDelay passed to calculate() should override, then we'd create a new instance:
    // const calculator = ExponentialBackoff.create(baseDelay, maxDelay, this.exponentialBackoffCalculator.getMultiplier());
    // return calculator.calculateDelay(attempts);
    //
    // However, if the strategy instance itself is pre-configured, then its internal calculator's params are used.
    // The prompt for ExponentialBackoffStrategy: "Usa ExponentialBackoff VO internamente."
    // This implies the strategy might be configured at construction.
    // Let's stick to using the internally configured calculator.
    // The parameters baseDelay and maxDelay on IBackoffStrategy.calculate might be for strategies
    // that don't have their own pre-configured VOs (like Linear, Fixed might use them directly).

    return this.exponentialBackoffCalculator.calculateDelay(attempts);
  }
}
