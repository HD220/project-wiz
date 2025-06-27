// src_refactored/core/domain/agent/value-objects/agent-max-iterations.vo.ts
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';

import { DomainError } from '@/domain/common/errors';

const MIN_ITERATIONS = 1;
const MAX_ITERATIONS = 100; // Arbitrary reasonable upper limit
const DEFAULT_ITERATIONS = 10;

export class AgentMaxIterationsError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'AgentMaxIterationsError';
  }
}

export class AgentMaxIterations extends AbstractValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  public static create(value: number): AgentMaxIterations {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new AgentMaxIterationsError('Max iterations must be an integer.');
    }
    if (value < MIN_ITERATIONS) {
      throw new AgentMaxIterationsError(
        `Max iterations must be at least ${MIN_ITERATIONS}.`
      );
    }
    if (value > MAX_ITERATIONS) {
      throw new AgentMaxIterationsError(
        `Max iterations must not exceed ${MAX_ITERATIONS}.`
      );
    }
    return new AgentMaxIterations(value);
  }

  public static default(): AgentMaxIterations {
    return new AgentMaxIterations(DEFAULT_ITERATIONS);
  }

  public get value(): number {
    return this.props;
  }
}
