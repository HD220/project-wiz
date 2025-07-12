export class LlmProvider {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly provider: string,
    public readonly model: string,
    public readonly apiKey: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 50;
  }
}
