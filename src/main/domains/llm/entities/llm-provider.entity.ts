export class LLMProvider {
  constructor(private readonly id: string) {}
  getId(): string {
    return this.id;
  }
}
