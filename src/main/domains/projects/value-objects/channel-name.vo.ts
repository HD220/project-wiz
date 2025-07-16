import {
  validateChannelName,
  isValidChannelName,
} from "./channel-name-validation.functions";

export class ChannelName {
  private readonly value: string;

  constructor(name: string) {
    this.value = validateChannelName(name);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ChannelName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static isValid(name: string): boolean {
    return isValidChannelName(name);
  }
}
