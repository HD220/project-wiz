// src_refactored/core/domain/job/value-objects/activity-history-entry.vo.ts
import { ValueObject } from '@/core/common/value-objects/base.vo';
import { DomainError, ValueError } from '@/domain/common/errors';
import { Result, ok, error } from '@/shared/result';

// Based on usage in generic-agent-executor.service.ts
// LanguageModelMessageToolCall is defined in generic-agent-executor.service.ts,
// it should ideally be in a shared location. For now, let's duplicate a minimal version or make it `any`.
// To avoid circular dependencies or too much complexity now, we'll use `any` for tool_calls structure.
interface MinimalToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export enum HistoryEntryRoleType {
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL_RESULT = 'tool_result',
  SYSTEM = 'system', // Added as it's a common role, though not explicitly seen in create() calls
}

export interface ActivityHistoryEntryProps {
  readonly role: HistoryEntryRoleType;
  readonly content: string | null; // Content can be null for assistant messages with only tool_calls
  readonly timestamp: Date;
  readonly toolName?: string;
  readonly toolCallId?: string;
  readonly tool_calls?: MinimalToolCall[]; // Simplified for now
}

export class ActivityHistoryEntry extends ValueObject<ActivityHistoryEntryProps> {
  private constructor(props: ActivityHistoryEntryProps) {
    super(props);
  }

  public static create(
    role: HistoryEntryRoleType,
    content: string | null,
    timestamp?: Date,
    toolName?: string,
    toolCallId?: string,
    tool_calls?: MinimalToolCall[],
  ): Result<ActivityHistoryEntry, ValueError> {
    if (!Object.values(HistoryEntryRoleType).includes(role)) {
      return error(new ValueError('Invalid role for history entry.'));
    }
    if (role === HistoryEntryRoleType.TOOL_RESULT && !toolCallId) {
      return error(new ValueError('toolCallId is required for tool_result role.'));
    }
    if (role === HistoryEntryRoleType.TOOL_RESULT && !toolName) {
        // Not strictly required by observed calls, but good practice
        // return error(new ValueError('toolName is required for tool_result role.'));
    }
    if (tool_calls && !Array.isArray(tool_calls)) {
        return error(new ValueError('tool_calls must be an array if provided.'));
    }
    // Content can be null (e.g. assistant message with only tool calls)
    // but not undefined if it's not a tool_call only message.
    // For simplicity, allowing null content broadly.

    const props: ActivityHistoryEntryProps = {
      role,
      content,
      timestamp: timestamp || new Date(),
      toolName,
      toolCallId,
      tool_calls,
    };
    return ok(new ActivityHistoryEntry(props));
  }

  role(): HistoryEntryRoleType {
    return this.props.role;
  }

  content(): string | null {
    return this.props.content;
  }

  timestamp(): Date {
    return this.props.timestamp;
  }

  toolName(): string | undefined {
    return this.props.toolName;
  }

  toolCallId(): string | undefined {
    return this.props.toolCallId;
  }

  tool_calls(): MinimalToolCall[] | undefined {
    return this.props.tool_calls;
  }

  // equals, toJSON etc. can be added as needed
}
