import { z } from 'zod';

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

import { ActivityHistoryEntryVO, ActivityEntryType } from './activity-history-entry.vo';

// Re-export for convenience if other modules import primarily from this VO file
export { ActivityHistoryEntryVO, ActivityEntryType };

const ActivityHistoryPropsSchema = z.object({
  entries: z.array(z.any()).default([]).readonly(),
  maxEntries: z.number().int().positive().optional().default(1000),
});

export class ActivityHistoryVO extends AbstractValueObject<z.infer<typeof ActivityHistoryPropsSchema>> {
  public static readonly DEFAULT_MAX_ENTRIES = 1000;

  private constructor(props: z.infer<typeof ActivityHistoryPropsSchema>) {
    super(props);
  }

  public static create(
    initialEntries?: ActivityHistoryEntryVO[],
    maxEntries?: number,
  ): ActivityHistoryVO {
    const validationResult = ActivityHistoryPropsSchema.safeParse({
      entries: initialEntries,
      maxEntries,
    });

    if (!validationResult.success) {
      throw new ValueError('Invalid activity history.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    return new ActivityHistoryVO(validationResult.data);
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
      throw new ValueError('Cannot add a null or undefined entry to activity history.');
    }
    const newEntries = [...this.props.entries, entry];
    const currentMaxEntries = this.props.maxEntries || ActivityHistoryVO.DEFAULT_MAX_ENTRIES;

    if (newEntries.length > currentMaxEntries) {
      // Trim oldest entries if limit is exceeded
      newEntries.splice(0, newEntries.length - currentMaxEntries);
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

