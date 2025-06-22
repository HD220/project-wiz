// src_refactored/core/domain/agent/value-objects/agent-temperature.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface AgentTemperatureProps extends ValueObjectProps {
  value: number;
}

export class AgentTemperature extends AbstractValueObject<AgentTemperatureProps> {
  private static readonly MIN_VALUE = 0.0;
  private static readonly MAX_VALUE = 2.0; // Common range for LLM temperature

  private constructor(value: number) {
    super({ value });
  }

  private static validate(temperature: number): void {
    if (temperature < this.MIN_VALUE || temperature > this.MAX_VALUE) {
      throw new Error(
        `Agent temperature must be between ${this.MIN_VALUE} and ${this.MAX_VALUE}. Received: ${temperature}`
      );
    }
  }

  public static create(temperature: number): AgentTemperature {
    this.validate(temperature);
    return new AgentTemperature(temperature);
  }

  public static default(): AgentTemperature {
    return new AgentTemperature(0.7); // A common default temperature
  }

  public value(): number {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value.toFixed(1); // Format to one decimal place
  }
}
