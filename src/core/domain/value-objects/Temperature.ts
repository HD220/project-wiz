export class Temperature {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Temperature {
    if (value < 0 || value > 2) {
      throw new Error('Temperature deve estar entre 0 e 2');
    }
    return new Temperature(value);
  }

  public getValue(): number {
    return this.value;
  }
}