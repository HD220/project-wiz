import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const MIN_TEMPERATURE = 0.0;
const MAX_TEMPERATURE = 2.0;
const DEFAULT_TEMPERATURE = 0.7;

const AgentTemperatureSchema = z.number()
  .min(MIN_TEMPERATURE, `Agent temperature must be between ${MIN_TEMPERATURE} and ${MAX_TEMPERATURE}.`)
  .max(MAX_TEMPERATURE, `Agent temperature must be between ${MIN_TEMPERATURE} and ${MAX_TEMPERATURE}.`);

interface AgentTemperatureProps extends ValueObjectProps {
  value: number;
}

export class AgentTemperature extends AbstractValueObject<AgentTemperatureProps> {
  private constructor(props: AgentTemperatureProps) {
    super(props);
  }

  public static create(temperature: number): AgentTemperature {
    const validationResult = AgentTemperatureSchema.safeParse(temperature);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid agent temperature: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new AgentTemperature({ value: validationResult.data });
  }

  public static default(): AgentTemperature {
    return new AgentTemperature({ value: DEFAULT_TEMPERATURE });
  }

  public get value(): number {
    return this.props.value;
  }

  public equals(vo?: AgentTemperature): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value.toFixed(1);
  }
}
