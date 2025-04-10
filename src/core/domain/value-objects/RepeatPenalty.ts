export class RepeatPenalty {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): RepeatPenalty {
    if (value < 0 || value > 2) {
      throw new Error('RepeatPenalty deve estar entre 0 e 2');
    }
    return new RepeatPenalty(value);
  }

  public getValue(): number {
    return this.value;
  }
}