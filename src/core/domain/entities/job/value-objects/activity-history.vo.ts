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

  // Getter `value` removed

  public forEach(callback: (entry: ActivityHistoryEntry) => void): void {
    this.entries.forEach(callback);
  }

  public map<U>(callback: (entry: ActivityHistoryEntry, index: number) => U): U[] {
    return this.entries.map(callback);
  }

  public filter(callback: (entry: ActivityHistoryEntry) => boolean): ActivityHistory {
    const filteredEntries = this.entries.filter(callback);
    return new ActivityHistory(filteredEntries);
  }

  public getLastEntry(): ActivityHistoryEntry | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    // Return a new instance or ensure ActivityHistoryEntry is immutable if returning directly
    // Assuming ActivityHistoryEntry is immutable or its consumers won't mutate it.
    return this.entries[this.entries.length - 1];
  }

  public isEmpty(): boolean {
    return this.entries.length === 0;
  }

  public count(): number {
    return this.entries.length;
  }
}
