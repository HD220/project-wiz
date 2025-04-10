export class Seed {
  private readonly value: number | null;

  private constructor(value: number | null) {
    this.value = value;
  }

  public static create(value: number | null | undefined): Seed {
    if (value === null || value === undefined) {
      return new Seed(null);
    }
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('Seed deve ser um inteiro maior ou igual a 0 ou null');
    }
    return new Seed(value);
  }

  public getValue(): number | null {
    return this.value;
  }
}