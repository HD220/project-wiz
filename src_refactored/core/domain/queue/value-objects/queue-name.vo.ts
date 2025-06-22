// src_refactored/core/domain/queue/value-objects/queue-name.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../common/value-objects/base.vo';
import { ValueError } from '../../../../common/errors';

interface QueueNameProps extends ValueObjectProps {
  value: string;
}

export class QueueName extends AbstractValueObject<QueueNameProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;
  // Regex for valid queue names: lowercase alphanumeric, underscores, hyphens
  // Must start and end with an alphanumeric character. Similar to UserUsername.
  private static readonly QUEUE_NAME_REGEX = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/;

  private constructor(props: QueueNameProps) {
    super(props);
  }

  public static create(name: string): QueueName {
    this.validate(name);
    return new QueueName({ value: name.toLowerCase() }); // Store as lowercase
  }

  private static validate(name: string): void {
    if (name === null || name === undefined) {
      throw new ValueError('Queue name cannot be null or undefined.');
    }
    const trimmedName = name.trim();
    if (trimmedName.length < this.MIN_LENGTH) {
      throw new ValueError(`Queue name must be at least ${this.MIN_LENGTH} characters long.`);
    }
    if (trimmedName.length > this.MAX_LENGTH) {
      throw new ValueError(`Queue name must be no more than ${this.MAX_LENGTH} characters long.`);
    }
    if (!this.QUEUE_NAME_REGEX.test(trimmedName.toLowerCase())) {
      throw new ValueError(
        'Queue name can only contain lowercase letters, numbers, underscores, and hyphens. ' +
        'It must start and end with a letter or number.'
      );
    }
  }

  public value(): string {
    return this.props.value;
  }
}
