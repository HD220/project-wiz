import { JobId } from "./job-id.vo";
import { DomainError } from "@/core/common/errors";

export class RelatedActivityIds {
  private constructor(private readonly ids: JobId[]) {
    if (!ids) {
      throw new DomainError("Related activity IDs cannot be null.");
    }
  }

  public static create(ids: JobId[]): RelatedActivityIds {
    return new RelatedActivityIds(ids);
  }

  public addId(id: JobId): RelatedActivityIds {
    if (this.ids.some((existingId) => existingId.equals(id))) {
      return this; // Avoid adding duplicate IDs
    }
    return new RelatedActivityIds([...this.ids, id]);
  }

  public get value(): JobId[] {
    return [...this.ids]; // Return a copy to maintain immutability
  }

  public has(id: JobId): boolean {
    return this.ids.some((existingId) => existingId.equals(id));
  }
}
