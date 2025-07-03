import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

export enum ActivityEntryType {
  THOUGHT = 'thought',
  OBSERVATION = 'observation',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',
  LLM_REQUEST = 'llm_request',
  LLM_RESPONSE = 'llm_response',
  SYSTEM_MESSAGE = 'system_message',
  ERROR = 'error',
}

const ActivityEntryTypeSchema = z.nativeEnum(ActivityEntryType);

const ActivityHistoryEntryPropsSchema = z.object({
  type: ActivityEntryTypeSchema,
  timestamp: z.date().default(() => new Date()),
  content: z.union([z.string(), z.record(z.string(), z.unknown())]),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export interface ActivityHistoryEntryProps extends z.infer<typeof ActivityHistoryEntryPropsSchema> {}

export class ActivityHistoryEntryVO extends AbstractValueObject<ActivityHistoryEntryProps> {
  private constructor(props: ActivityHistoryEntryProps) {
    super(props);
  }

  public static create(
    type: ActivityEntryType,
    content: string | object,
    metadata?: Record<string, unknown>,
    timestamp?: Date,
  ): ActivityHistoryEntryVO {
    const validationResult = ActivityHistoryEntryPropsSchema.safeParse({
      type,
      content,
      timestamp,
      metadata,
    });

    if (!validationResult.success) {
      throw new ValueError('Invalid activity history entry.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    return new ActivityHistoryEntryVO(validationResult.data);
  }

  get type(): ActivityEntryType {
    return this.props.type;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get content(): string | object {
    return this.props.content;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  public equals(vo?: ActivityHistoryEntryVO): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    const contentStr = typeof this.props.content === 'string' ? this.props.content : JSON.stringify(this.props.content);
    return `[${this.props.timestamp.toISOString()}] ${this.props.type.toUpperCase()}: ${contentStr}`;
  }
}
