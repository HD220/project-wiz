// src_refactored/core/domain/job/value-objects/job-timestamp.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface JobTimestampProps extends ValueObjectProps {
  value: Date;
}

export class JobTimestamp extends AbstractValueObject<JobTimestampProps> {
  private constructor(value: Date) {
    super({ value });
  }

  private static validate(date: Date): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid Date object provided for JobTimestamp.');
    }
  }

  public static create(date: Date): JobTimestamp {
    this.validate(date);
    // Store a new Date object to ensure immutability if the input Date object is later modified.
    return new JobTimestamp(new Date(date.getTime()));
  }

  public static now(): JobTimestamp {
    return new JobTimestamp(new Date());
  }

  public static fromMilliseconds(ms: number): JobTimestamp {
    return new JobTimestamp(new Date(ms));
  }

  public value(): Date {
    // Return a new Date object to prevent external modification of the internal state.
    return new Date(this.props.value.getTime());
  }

  public milliseconds(): number {
    return this.props.value.getTime();
  }

  public isInThePast(): boolean {
    return this.props.value.getTime() < Date.now();
  }

  public isAfter(otherTimestamp: JobTimestamp): boolean {
    return this.props.value.getTime() > otherTimestamp.milliseconds();
  }

  public isBefore(otherTimestamp: JobTimestamp): boolean {
    return this.props.value.getTime() < otherTimestamp.milliseconds();
  }

  public toISOString(): string {
    return this.props.value.toISOString();
  }

  public toString(): string {
    return this.props.value.toISOString();
  }
}
