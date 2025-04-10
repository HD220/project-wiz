export class MaxTokens {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): MaxTokens {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('MaxTokens deve ser um inteiro maior que 0');
    }
    return new MaxTokens(value);
  }

  public getValue(): number {
    return this.value;
  }
}