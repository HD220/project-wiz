import { z } from "zod";

const SenderTypeSchema = z.enum(["user", "agent"], {
  errorMap: () => ({ message: "Sender type must be user or agent" }),
});

export type SenderTypeValue = z.infer<typeof SenderTypeSchema>;

export class SenderType {
  constructor(type: SenderTypeValue) {
    const validated = SenderTypeSchema.parse(type);
    this.value = validated;
  }

  private readonly value: SenderTypeValue;

  getValue(): SenderTypeValue {
    return this.value;
  }

  isUser(): boolean {
    return this.value === "user";
  }

  equals(other: SenderType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
