// More complex VO, details TBD, for now a basic structure
export type HistoryEntryActor = 'user' | 'agent' | 'system' | 'tool';
export interface ActivityHistoryEntryData {
  timestamp: Date;
  actor: HistoryEntryActor;
  message?: string; // For chat-like entries or descriptions
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolResult?: any;
  // Add other relevant fields like LLM call details, etc.
}

export class ActivityHistoryEntry {
  private readonly data: Readonly<ActivityHistoryEntryData>;

  private constructor(data: ActivityHistoryEntryData) {
    // Add validation as needed
    this.data = Object.freeze(data);
  }

  public static create(data: ActivityHistoryEntryData): ActivityHistoryEntry {
    return new ActivityHistoryEntry(data);
  }

  public getData(): Readonly<ActivityHistoryEntryData> {
    return this.data;
  }

  public getTimestamp(): Date {
    return this.data.timestamp;
  }
}
