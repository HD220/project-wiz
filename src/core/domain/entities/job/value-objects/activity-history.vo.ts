import { ActivityHistoryEntry } from './activity-history-entry.vo';

// First-Class Collection (Object Calisthenics Rule 4)
export class ActivityHistory {
  private readonly entries: ReadonlyArray<ActivityHistoryEntry>;

  private constructor(entries: ActivityHistoryEntry[]) {
    this.entries = Object.freeze([...entries]); // Defensive copy and freeze
  }

  public static create(entries?: ActivityHistoryEntry[]): ActivityHistory {
    return new ActivityHistory(entries || []);
  }

  public addEntry(entry: ActivityHistoryEntry): ActivityHistory {
    return new ActivityHistory([...this.entries, entry]);
  }

  public getEntries(): ReadonlyArray<ActivityHistoryEntry> {
    return this.entries;
  }

  public getLength(): number {
    return this.entries.length;
  }
}
