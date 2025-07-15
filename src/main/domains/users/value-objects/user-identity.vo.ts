import { z } from "zod";

const UserIdentitySchema = z
  .string()
  .uuid("User identity must be a valid UUID");

export class UserIdentity {
  constructor(id: string) {
    const validated = UserIdentitySchema.parse(id);
    this.value = validated;
  }

  private readonly value: string;

  getValue(): string {
    return this.value;
  }

  equals(other: UserIdentity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
