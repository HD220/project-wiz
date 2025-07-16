export class SimpleVO {
  constructor(private readonly value: string) {}
  getValue(): string {
    return this.value;
  }
}
