import { Identity } from "../../../../common/identity";
import { randomUUID } from "crypto";

export class JobId extends Identity<string> {
  constructor(value: string) {
    super(value);
  }

  static generate(): JobId {
    return new JobId(randomUUID());
  }
}
