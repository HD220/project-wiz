// src_refactored/core/domain/job/value-objects/activity-history.vo.ts
import { ValueObject } from '@/core/common/value-objects/base.vo'; // Assuming a base VO class
import { DomainError } from '@/core/domain/common/errors';

import { ActivityHistoryEntryVO, ActivityEntryType } from './activity-history-entry.vo';

export interface ActivityHistoryProps {
  entries: ReadonlyArray<ActivityHistoryEntryVO>;
  maxEntries?: number; // Optional: to limit the size of the history
}

export class ActivityHistoryVO extends ValueObject<ActivityHistoryProps> {
  public static readonly DEFAULT_MAX_ENTRIES = 1000; // Default limit for entries

  private constructor(props: ActivityHistoryProps) {
    super(props);
  }

  public static create(
    initialEntries?: ActivityHistoryEntryVO[],
    maxEntries?: number,
  ): ActivityHistoryVO {
    const entries = initialEntries ? Object.freeze([...initialEntries]) : Object.freeze([]);
    if (maxEntries !== undefined && maxEntries <= 0) {
      throw new DomainError('maxEntries for ActivityHistoryVO must be a positive number.');
    }
    return new ActivityHistoryVO({
      entries,
      maxEntries: maxEntries || ActivityHistoryVO.DEFAULT_MAX_ENTRIES,
    });
  }

  get entries(): ReadonlyArray<ActivityHistoryEntryVO> {
    return this.props.entries;
  }

  get length(): number {
    return this.props.entries.length;
  }

  get maxEntries(): number | undefined {
    return this.props.maxEntries;
  }

  public addEntry(entry: ActivityHistoryEntryVO): ActivityHistoryVO {
    if (!entry) {
      throw new DomainError('Cannot add a null or undefined entry to activity history.');
    }
    const newEntries = [...this.props.entries, entry];
    if (this.props.maxEntries && newEntries.length > this.props.maxEntries) {
      // Trim oldest entries if limit is exceeded
      newEntries.splice(0, newEntries.length - this.props.maxEntries);
    }
    return new ActivityHistoryVO({
      ...this.props,
      entries: Object.freeze(newEntries),
    });
  }

  public findLastEntryByType(type: ActivityEntryType): ActivityHistoryEntryVO | undefined {
    for (let index = this.props.entries.length - 1; index >= 0; index--) {
      if (this.props.entries[index].type === type) {
        return this.props.entries[index];
      }
    }
    return undefined;
  }

  public toStringArray(): string[] {
    return this.props.entries.map(entry => entry.toString());
  }

  public static fromPersistence(data: {
    entries: Array<{ type: ActivityEntryType; content: string | object; timestamp: string | number | Date; metadata?: Record<string, unknown> }>;
    maxEntries?: number;
  }): ActivityHistoryVO {
    const entries = (data.entries || []).map(entryData =>
      ActivityHistoryEntryVO.create(
        entryData.type,
        entryData.content,
        entryData.metadata,
        new Date(entryData.timestamp),
      ),
    );
    return ActivityHistoryVO.create(entries, data.maxEntries);
  }

  public toPersistence(): {
    entries: Array<{ type: ActivityEntryType; content: string | object; timestamp: string; metadata?: Record<string, unknown> }>;
    maxEntries?: number;
  } {
    return {
      entries: this.props.entries.map(entry => ({
        type: entry.type,
        content: entry.content,
        timestamp: entry.timestamp.toISOString(),
        metadata: entry.metadata,
      })),
      maxEntries: this.props.maxEntries,
    };
  }
}
