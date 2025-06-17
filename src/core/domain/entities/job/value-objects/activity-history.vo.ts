import { ActivityHistoryEntry } from "./activity-history-entry.vo";
import { DomainError } from "@/core/common/errors";

export class ActivityHistory {
  private constructor(private readonly entries: ActivityHistoryEntry[]) {
    if (!entries) {
      throw new DomainError("Activity history entries cannot be null.");
    }
  }

  public static create(entries: ActivityHistoryEntry[]): ActivityHistory {
    return new ActivityHistory(entries);
  }

  public addEntry(entry: ActivityHistoryEntry): ActivityHistory {
    return new ActivityHistory([...this.entries, entry]);
  }

  public get value(): ActivityHistoryEntry[] {
    return [...this.entries]; // Return a copy to maintain immutability
  }
}
