// src_refactored/core/domain/job/value-objects/activity-history.vo.ts
import { ValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/domain/common/errors'; // Corrected path
import { Result, ok, error } from '@/shared/result';
import { ActivityHistoryEntry, ActivityHistoryEntryProps } from './activity-history-entry.vo';

export interface ActivityHistoryPropsVO { // Renamed to avoid conflict with ActivityHistoryEntryProps
  readonly entries: ReadonlyArray<ActivityHistoryEntry>;
}

export class ActivityHistory extends ValueObject<ActivityHistoryPropsVO> {
  private constructor(props: ActivityHistoryPropsVO) {
    super(props);
  }

  public static create(initialEntries?: ReadonlyArray<ActivityHistoryEntry | ActivityHistoryEntryProps>): ActivityHistory {
    const entries = initialEntries
      ? initialEntries.map(entry =>
          entry instanceof ActivityHistoryEntry
            ? entry
            : ActivityHistoryEntry.create( // Assuming create returns Result, handle it
                entry.role,
                entry.content,
                entry.timestamp ? new Date(entry.timestamp) : undefined, // Ensure Date object
                entry.toolName,
                entry.toolCallId,
                entry.tool_calls
              ).orDefault(null) // Provide a default or handle error appropriately
        ).filter(e => e !== null) as ActivityHistoryEntry[] // Filter out nulls if create can fail
      : [];
    return new ActivityHistory({ entries: Object.freeze([...entries]) });
  }

  public addEntry(entry: ActivityHistoryEntry): ActivityHistory {
    if (!entry || !(entry instanceof ActivityHistoryEntry)) {
      console.error('Invalid entry passed to ActivityHistory.addEntry');
      return this;
    }
    const newEntries = [...this.props.entries, entry];
    return new ActivityHistory({ entries: Object.freeze(newEntries) });
  }

  public entries(): ReadonlyArray<ActivityHistoryEntry> {
    return this.props.entries;
  }

  public isEmpty(): boolean {
    return this.props.entries.length === 0;
  }

  public getProps(): ActivityHistoryPropsVO {
    return this.props;
  }

  public toPersistence(): ActivityHistoryEntryProps[] {
    return this.props.entries.map(entry => entry.props); // entry.props directly returns ActivityHistoryEntryProps
  }
}
