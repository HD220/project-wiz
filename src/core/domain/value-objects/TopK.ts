export class TopK {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): TopK {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('TopK deve ser um inteiro maior ou igual a 0');
    }
    return new TopK(value);
  }

  public getValue(): number {
    return this.value;
  }
}