import { MaxTokens } from "./max-tokens.vo";
import { Temperature } from "./temperature.vo";

export class ModelConfig {
  constructor(temperature: Temperature, maxTokens: MaxTokens) {
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  private readonly temperature: Temperature;
  private readonly maxTokens: MaxTokens;

  getTemperature(): Temperature {
    return this.temperature;
  }

  getMaxTokens(): MaxTokens {
    return this.maxTokens;
  }

  equals(other: ModelConfig): boolean {
    return (
      this.temperature.equals(other.temperature) &&
      this.maxTokens.equals(other.maxTokens)
    );
  }

  toConfigObject(): { temperature: number; maxTokens: number } {
    return {
      temperature: this.temperature.getValue(),
      maxTokens: this.maxTokens.getValue(),
    };
  }
}
