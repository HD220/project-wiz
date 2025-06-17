import { Identity } from "@/core/common/identity";
import { randomUUID } from "crypto";

export class JobId extends Identity<string> {
  static generate(): JobId {
    return new JobId(randomUUID());
  }
}
