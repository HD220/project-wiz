import { z } from "zod";

import { ValidationError } from "../../../errors/validation.error";

const ChannelPrivacySchema = z.boolean();

export class ChannelPrivacy {
  private readonly value: boolean;

  constructor(isPrivate: boolean = false) {
    this.value = this.validatePrivacy(isPrivate);
  }

  private validatePrivacy(privacy: boolean): boolean {
    try {
      return ChannelPrivacySchema.parse(privacy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField(
          "channelPrivacy",
          firstError.message,
          privacy,
        );
      }
      throw error;
    }
  }

  getValue(): boolean {
    return this.value;
  }

  equals(other: ChannelPrivacy): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ? "private" : "public";
  }

  isPrivate(): boolean {
    return this.value;
  }

  isPublic(): boolean {
    return !this.value;
  }

  static isValid(isPrivate: boolean): boolean {
    try {
      ChannelPrivacySchema.parse(isPrivate);
      return true;
    } catch {
      return false;
    }
  }
}