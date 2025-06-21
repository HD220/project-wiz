import { z } from "zod";
import { Identity } from "../../../../common/identity";

const queueIdSchema = z.string().uuid();

export class QueueId extends Identity<string> {
  constructor(value: string) {
    queueIdSchema.parse(value);
    super(value);
  }

  equals(other: QueueId): boolean {
    return this.value === other.value;
  }
}
