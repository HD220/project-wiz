export class FrequencyPenalty {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): FrequencyPenalty {
    if (value < -2 || value > 2) {
      throw new Error('FrequencyPenalty deve estar entre -2 e 2');
    }
    return new FrequencyPenalty(value);
  }

  public getValue(): number {
    return this.value;
  }
}