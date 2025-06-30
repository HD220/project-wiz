// src_refactored/core/domain/job/value-objects/activity-history-entry.vo.ts
import { ValueObject } from '@/core/common/value-objects/base.vo'; // Assuming a base VO class exists
import { ValueError } from '@/core/domain/common/errors'; // Removed DomainError

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

export interface ActivityHistoryEntryProps {
  type: ActivityEntryType;
  timestamp: Date;
  content: string | object; // Could be simple text or structured data (e.g., tool call details)
  metadata?: Record<string, unknown>; // Optional metadata
}

export class ActivityHistoryEntryVO extends ValueObject<ActivityHistoryEntryProps> {
  private constructor(props: ActivityHistoryEntryProps) {
    super(props);
  }

  public static create(
    type: ActivityEntryType,
    content: string | object,
    metadata?: Record<string, unknown>,
    timestamp?: Date,
  ): ActivityHistoryEntryVO {
    if (!type || !Object.values(ActivityEntryType).includes(type)) {
      throw new ValueError('Activity entry type is invalid or missing.');
    }
    if (content === undefined || content === null) {
      throw new ValueError('Activity entry content cannot be undefined or null.');
    }

    const props: ActivityHistoryEntryProps = {
      type,
      content,
      timestamp: timestamp || new Date(),
      metadata: metadata || {},
    };
    return new ActivityHistoryEntryVO(props);
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

  public toString(): string {
    const contentStr = typeof this.props.content === 'string' ? this.props.content : JSON.stringify(this.props.content);
    return `[${this.props.timestamp.toISOString()}] ${this.props.type.toUpperCase()}: ${contentStr}`;
  }
}
