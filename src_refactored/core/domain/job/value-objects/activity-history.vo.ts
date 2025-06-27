// src_refactored/core/domain/job/value-objects/activity-history.vo.ts
import { ValueObject } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors';

import { Result, ok, error } from '@/shared/result';

import { ActivityHistoryEntry, ActivityHistoryEntryProps } from './activity-history-entry.vo'; // Assuming .vo extension

export interface ActivityHistoryProps {
  readonly entries: ReadonlyArray<ActivityHistoryEntry>;
}

export class ActivityHistory extends ValueObject<ActivityHistoryProps> {
  private constructor(props: ActivityHistoryProps) {
    super(props);
  }

  public static create(initialEntries?: ActivityHistoryEntry[]): ActivityHistory {
    return new ActivityHistory({ entries: initialEntries ? Object.freeze([...initialEntries]) : Object.freeze([]) });
  }

  public addEntry(entry: ActivityHistoryEntry): ActivityHistory {
    if (!entry || !(entry instanceof ActivityHistoryEntry)) {
      // This case should ideally not happen if entry is type-checked, but as a safeguard.
      // Consider if an error Result should be returned if create can fail.
      // For now, assuming valid entry is passed.
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

  public getProps(): ActivityHistoryProps { // Method to get underlying props if needed elsewhere
    return this.props;
  }

  // Consider adding other useful methods: lastEntry(), findEntryById(), etc.
  // For immutability, all modification methods should return a new ActivityHistory instance.
}
