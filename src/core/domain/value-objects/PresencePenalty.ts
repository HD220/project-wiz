export class PresencePenalty {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): PresencePenalty {
    if (value < -2 || value > 2) {
      throw new Error('PresencePenalty deve estar entre -2 e 2');
    }
    return new PresencePenalty(value);
  }

  public getValue(): number {
    return this.value;
  }
}