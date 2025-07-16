import { z } from "zod";

const MessageContentSchema = z
  .string()
  .min(1, "Message content cannot be empty")
  .max(10000, "Message content too long");

export class MessageContent {
  constructor(content: string) {
    const validated = MessageContentSchema.parse(content);
    this.value = validated;
  }

  private readonly value: string;

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value.trim().length === 0;
  }

  equals(other: MessageContent): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
