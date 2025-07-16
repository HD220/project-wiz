import {
  validateChannelDescription,
  isValidChannelDescription,
} from "./channel-description-validation.functions";

export class ChannelDescription {
  private readonly value: string | null;

  constructor(description?: string | null) {
    this.value = validateChannelDescription(description);
  }

  getValue(): string | null {
    return this.value;
  }

  equals(other: ChannelDescription): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ?? "";
  }

  isEmpty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }

  static isValid(description?: string | null): boolean {
    return isValidChannelDescription(description);
  }
}
