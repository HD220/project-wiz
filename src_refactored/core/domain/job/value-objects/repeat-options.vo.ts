// src_refactored/core/domain/job/value-objects/repeat-options.vo.ts
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors';

export interface RepeatOptionsProps {
  readonly cron?: string; // Standard cron string
  readonly every?: number; // Interval in milliseconds
  readonly limit?: number; // Max number of repetitions
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly tz?: string; // Timezone for cron e.g. 'America/New_York'
}

export class RepeatOptionsVO extends AbstractValueObject<Readonly<RepeatOptionsProps>> {
  private constructor(props: Readonly<RepeatOptionsProps>) {
    super(props);
  }

  public static create(props?: RepeatOptionsProps): RepeatOptionsVO {
    if (!props) {
      // Or return a default empty object if that's valid, for now, let's assume if created, it has some options.
      // This path should ideally not be taken if repeat options are truly optional at JobOptions level.
      // If JobOptions.repeat is undefined, then RepeatOptionsVO is not created.
      // If JobOptions.repeat is an empty object {}, then this constructor would be called with {}.
      // Consider if an empty RepeatOptionsVO is valid or if it must have at least 'cron' or 'every'.
      // For now, allowing an empty props object to pass, assuming validation is handled by consumer.
      return new RepeatOptionsVO(Object.freeze({} as RepeatOptionsProps));
    }

    const { cron, every, limit, startDate, endDate, tz } = props;

    if (cron && every) {
      throw new ValueError('RepeatOptions cannot have both cron and every defined.');
    }
    if (!cron && !every) {
      // This might be a valid case if e.g. only a limit is set for a manually triggered repeatable job,
      // but typically one would expect cron or every. For now, let's allow it.
      // Consider if this should throw: throw new ValueError('RepeatOptions must have either cron or every defined.');
    }

    if (every && every <= 0) {
      throw new ValueError('RepeatOptions.every must be a positive number.');
    }
    if (limit && limit < 0) {
      throw new ValueError('RepeatOptions.limit cannot be negative.');
    }
    if (startDate && endDate && startDate >= endDate) {
      throw new ValueError('RepeatOptions.startDate must be before endDate.');
    }

    // Basic cron validation (5 or 6 parts)
    if (cron && !/^((\*|[0-9,-]+)\s){4,5}(\*|[0-9,-]+)$/.test(cron)) {
      throw new ValueError('RepeatOptions.cron has an invalid format.');
    }

    // Timezone validation could be more complex (e.g., checking against Intl.supportedValuesOf('timeZone'))
    // For now, a simple check if it's a non-empty string.
    if (tz && tz.trim() === '') {
      throw new ValueError('RepeatOptions.tz cannot be an empty string.');
    }

    return new RepeatOptionsVO(
      Object.freeze({
        cron,
        every,
        limit,
        startDate,
        endDate,
        tz,
      }),
    );
  }

  get cron(): string | undefined { return this.props.cron; }
  get every(): number | undefined { return this.props.every; }
  get limit(): number | undefined { return this.props.limit; }
  get startDate(): Date | undefined { return this.props.startDate; }
  get endDate(): Date | undefined { return this.props.endDate; }
  get tz(): string | undefined { return this.props.tz; }

  public static empty(): RepeatOptionsVO {
    return new RepeatOptionsVO(Object.freeze({} as RepeatOptionsProps));
  }

  public hasSchedule(): boolean {
    return !!this.props.cron || !!this.props.every;
  }
}
