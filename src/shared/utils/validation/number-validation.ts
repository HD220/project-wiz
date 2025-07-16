export class NumberValidation {
  static isInRange(value: number, min: number, max: number): boolean {
    return typeof value === "number" && value >= min && value <= max;
  }

  static isValidTemperature(temperature: number): boolean {
    return this.isInRange(temperature, 0.0, 2.0);
  }

  static isValidMaxTokens(maxTokens: number): boolean {
    return Number.isInteger(maxTokens) && this.isInRange(maxTokens, 1, 10000);
  }
}
