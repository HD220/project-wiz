import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/common-domain.errors';

const MIN_ITERATIONS = 1;
const MAX_ITERATIONS = 100;
const DEFAULT_ITERATIONS = 10;

const AgentMaxIterationsSchema = z.number()
  .int('Max iterations must be an integer.')
  .min(MIN_ITERATIONS, `Max iterations must be at least ${MIN_ITERATIONS}.`)
  .max(MAX_ITERATIONS, `Max iterations must not exceed ${MAX_ITERATIONS}.`);

interface AgentMaxIterationsProps extends ValueObjectProps {
  value: number;
}

export class AgentMaxIterations extends AbstractValueObject<AgentMaxIterationsProps> {
  private constructor(props: AgentMaxIterationsProps) {
    super(props);
  }

  public static create(value: number): AgentMaxIterations {
    const validationResult = AgentMaxIterationsSchema.safeParse(value);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid agent max iterations: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new AgentMaxIterations({ value: validationResult.data });
  }

  public static default(): AgentMaxIterations {
    return new AgentMaxIterations({ value: DEFAULT_ITERATIONS });
  }

  public get value(): number {
    return this.props.value;
  }

  public equals(vo?: AgentMaxIterations): boolean {
    return super.equals(vo);
  }
}
