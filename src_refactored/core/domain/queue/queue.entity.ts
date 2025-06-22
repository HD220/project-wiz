// src_refactored/core/domain/queue/queue.entity.ts
import { AbstractEntity, EntityProps } from '../../../core/common/base.entity';
import { QueueId } from './value-objects/queue-id.vo';
import { QueueName } from './value-objects/queue-name.vo';
import { QueueConcurrency } from './value-objects/queue-concurrency.vo';
import { QueueDescription } from './value-objects/queue-description.vo';
import { EntityError, ValueError } from '../../../core/common/errors';

export interface QueueProps {
  id: QueueId;
  name: QueueName;
  concurrency: QueueConcurrency;
  description: QueueDescription; // Should be initialized even if null
  createdAt?: Date;
  updatedAt?: Date;
}

interface InternalQueueProps extends EntityProps<QueueId> {
  name: QueueName;
  concurrency: QueueConcurrency;
  description: QueueDescription;
}

export class Queue extends AbstractEntity<QueueId, InternalQueueProps> {
  private constructor(props: InternalQueueProps) {
    super(props);
  }

  public static create(props: QueueProps): Queue {
    this.validateProps(props);

    const now = new Date();
    const internalProps: InternalQueueProps = {
      id: props.id,
      name: props.name,
      concurrency: props.concurrency,
      description: props.description || QueueDescription.create(null), // Ensure VO instance
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new Queue(internalProps);
  }

  private static validateProps(props: QueueProps): void {
    if (!props.id) throw new EntityError('Queue ID is required.');
    if (!props.name) throw new EntityError('Queue name is required.');
    if (!props.concurrency) throw new EntityError('Queue concurrency is required.');
    // description is handled with a default if not provided
  }

  // --- Getters for VOs ---
  public name(): QueueName { return this.props.name; }
  public concurrency(): QueueConcurrency { return this.props.concurrency; }
  public description(): QueueDescription { return this.props.description; }

  // --- Update Methods ---
  public updateDetails(params: {
    name?: QueueName;
    description?: QueueDescription;
  }): Queue {
    const newProps = { ...this.props };
    let updated = false;

    if (params.name && !this.props.name.equals(params.name)) {
      newProps.name = params.name;
      updated = true;
    }
    if (params.description && !this.props.description.equals(params.description)) {
      newProps.description = params.description;
      updated = true;
    }

    if (updated) {
      newProps.updatedAt = new Date();
      return new Queue(newProps);
    }
    return this; // No changes
  }

  public setConcurrency(newConcurrency: QueueConcurrency): Queue {
    if (!newConcurrency) throw new ValueError('New concurrency cannot be null or undefined.');
    if (this.props.concurrency.equals(newConcurrency)) {
      return this; // No change
    }
    const newProps = { ...this.props, concurrency: newConcurrency, updatedAt: new Date() };
    return new Queue(newProps);
  }
}
