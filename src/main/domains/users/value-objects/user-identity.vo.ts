import { createUuidValueObject } from "../../../shared/value-objects/base-value-object";

export class UserIdentity extends createUuidValueObject() {
  static create(id: string): UserIdentity {
    return new UserIdentity(id);
  }
}
