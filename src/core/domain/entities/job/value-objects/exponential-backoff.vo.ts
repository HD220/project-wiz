interface ExponentialBackoffProps {
  initialDelay: number;
  maxDelay?: number;
  multiplier?: number;
}

export class ExponentialBackoff {
  private readonly props: ExponentialBackoffProps;

  constructor(initialDelay: number, maxDelay?: number, multiplier = 2) {
    this.props = { initialDelay, maxDelay, multiplier };
  }

  get value(): ExponentialBackoffProps {
    return this.props;
  }

  calculateDelay(attempts: number): number {
    let delay =
      this.props.initialDelay *
      Math.pow(this.props.multiplier || 2, attempts - 1);
    if (this.props.maxDelay && delay > this.props.maxDelay) {
      delay = this.props.maxDelay;
    }
    return delay;
  }
}
