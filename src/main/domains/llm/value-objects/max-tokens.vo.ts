import { z } from "zod";

const MaxTokensSchema = z
  .number()
  .int("Max tokens must be an integer")
  .min(1, "Max tokens must be at least 1")
  .max(10000, "Max tokens must be at most 10000");

export class MaxTokens {
  constructor(maxTokens: number) {
    const validated = MaxTokensSchema.parse(maxTokens);
    this.value = validated;
  }

  private readonly value: number;

  getValue(): number {
    return this.value;
  }

  equals(other: MaxTokens): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }

  isShortResponse(): boolean {
    return this.value <= 500;
  }

  isMediumResponse(): boolean {
    return this.value > 500 && this.value <= 2000;
  }

  isLongResponse(): boolean {
    return this.value > 2000;
  }
}
