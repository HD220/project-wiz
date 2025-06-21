import { z } from "zod";

const agentTemperatureSchema = z.number();
export class AgentTemperature {
  constructor(private readonly temperature: number) {
    agentTemperatureSchema.parse(temperature);
  }
  get value() {
    return this.temperature;
  }
}
