import { Identity } from "@/core/common/value-objects/identity.vo";

export class UserId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): UserId {
    return new UserId(super.generate().value);
  }

  public static fromString(value: string): UserId {
    return new UserId(value);
  }
}
