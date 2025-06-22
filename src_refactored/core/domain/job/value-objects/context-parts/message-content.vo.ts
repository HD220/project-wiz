// src_refactored/core/domain/job/value-objects/context-parts/message-content.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

interface MessageContentProps extends ValueObjectProps {
  value: string;
}

export class MessageContent extends AbstractValueObject<MessageContentProps> {
  private static readonly MAX_LENGTH = 10000; // Arbitrary limit for message content

  private constructor(value: string) {
    super({ value });
  }

  private static validate(content: string): void {
    // Content can be empty (e.g. if an agent tool call has no textual input but only args)
    // but not null/undefined.
    if (content === null || content === undefined) {
        throw new Error('Message content cannot be null or undefined.');
    }
    if (content.length > this.MAX_LENGTH) {
      throw new Error(`Message content must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(content: string): MessageContent {
    this.validate(content);
    return new MessageContent(content);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
