// src_refactored/core/domain/job/value-objects/activity-history.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';
import { ActivityHistoryEntry } from './activity-history-entry.vo';

interface ActivityHistoryProps extends ValueObjectProps {
  entries: ReadonlyArray<ActivityHistoryEntry>;
}

export class ActivityHistory extends AbstractValueObject<ActivityHistoryProps> {
  private constructor(entries: ActivityHistoryEntry[]) {
    // Ensure the array passed to super is a frozen copy
    super({ entries: Object.freeze([...entries]) });
  }

  public static create(entries: ActivityHistoryEntry[] = []): ActivityHistory {
    if (!Array.isArray(entries)) {
      throw new Error('Entries must be an array to create ActivityHistory.');
    }
    // Entries themselves are VOs and should be validated upon their own creation.
    return new ActivityHistory(entries);
  }

  public entries(): ReadonlyArray<ActivityHistoryEntry> {
    // Return a new array copy to ensure immutability of the internal state if the ReadonlyArray is somehow bypassed.
    return [...this.props.entries];
  }

  public addEntry(entry: ActivityHistoryEntry): ActivityHistory {
    if (!entry || !(entry instanceof ActivityHistoryEntry)) {
      throw new Error('Invalid entry provided to add to ActivityHistory.');
    }
    const newEntries = [...this.props.entries, entry];
    return new ActivityHistory(newEntries);
  }

  public count(): number {
    return this.props.entries.length;
  }

  public isEmpty(): boolean {
    return this.props.entries.length === 0;
  }

  // Override equals for a more robust comparison if needed,
  // especially if order of entries matters or deep equality of entries is complex.
  // The base AbstractValueObject.equals uses JSON.stringify, which is order-sensitive for arrays.
  // For history, order usually matters.
  public equals(other?: ActivityHistory): boolean {
    if (!super.equals(other) || !(other instanceof ActivityHistory)) {
        return false;
    }
    if (this.props.entries.length !== other.props.entries.length) {
        return false;
    }
    for (let i = 0; i < this.props.entries.length; i++) {
        if (!this.props.entries[i].equals(other.props.entries[i])) {
            return false;
        }
    }
    return true;
  }

  // Method to convert to AI SDK Message[] type, if needed for interop
  // This depends on the exact structure of 'ai' Message type
  // For now, this is a conceptual placeholder.
  /*
  public toAiMessages(): any[] { // Replace 'any' with 'Message' from 'ai'
    return this.props.entries.map(entry => {
      return {
        role: entry.role(), // This needs mapping if role names differ
        content: entry.content(),
        // Potentially map tool_callId, toolName to tool_calls structure in 'ai' Message
      };
    });
  }
  */
}
