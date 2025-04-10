export class TopP {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): TopP {
    if (value < 0 || value > 1) {
      throw new Error('TopP deve estar entre 0 e 1');
    }
    return new TopP(value);
  }

  public getValue(): number {
    return this.value;
  }
}