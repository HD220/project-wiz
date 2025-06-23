// src_refactored/core/domain/job/value-objects/activity-history-entry.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';
import { JobTimestamp } from './job-timestamp.vo'; // Added missing import

// Based on 'ai' package Message role types, plus 'tool_result'
export enum HistoryEntryRoleType {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL_CALL = 'tool_call',     // When the assistant decides to call a tool
  TOOL_RESULT = 'tool_result', // The result from executing the tool
}

// Could be a more complex object if tool calls/results need structured data
// For now, keeping content as string or stringified JSON for simplicity.
// A dedicated ToolCallContentVO and ToolResultContentVO could be made.
interface EntryContentProps extends ValueObjectProps {
  value: string; // Can be natural language, JSON string for tool args/results, etc.
}
class EntryContent extends AbstractValueObject<EntryContentProps> {
    private constructor(value: string) { super({value}); }
    public static create(content: string): EntryContent {
        if (content === null || content === undefined) throw new Error("Entry content cannot be null or undefined.");
        return new EntryContent(content);
    }
    public value(): string { return this.props.value; }
}


interface HistoryEntryRoleProps extends ValueObjectProps {
    value: HistoryEntryRoleType;
}
class HistoryEntryRole extends AbstractValueObject<HistoryEntryRoleProps> {
    private constructor(value: HistoryEntryRoleType) { super({value}); }
    public static create(role: HistoryEntryRoleType): HistoryEntryRole {
        if (!Object.values(HistoryEntryRoleType).includes(role)) {
            throw new Error(`Invalid HistoryEntryRoleType: ${role}`);
        }
        return new HistoryEntryRole(role);
    }
    public value(): HistoryEntryRoleType { return this.props.value; }
}


import { LanguageModelMessageToolCall } from '@/refactored/core/ports/adapters/llm-adapter.types'; // Import the type

interface ActivityHistoryEntryProps extends ValueObjectProps {
  role: HistoryEntryRole;
  content: EntryContent;
  timestamp: JobTimestamp;
  toolName?: string;
  toolCallId?: string;
  tool_calls?: ReadonlyArray<LanguageModelMessageToolCall>; // For ASSISTANT role when making tool calls
}

export class ActivityHistoryEntry extends AbstractValueObject<ActivityHistoryEntryProps> {
  private constructor(props: ActivityHistoryEntryProps) {
    super(props);
  }

  public static create(
    roleType: HistoryEntryRoleType,
    contentValue: string | null, // Content can be null for assistant messages with tool_calls
    timestamp?: JobTimestamp,
    toolName?: string,
    toolCallId?: string,
    tool_calls?: ReadonlyArray<LanguageModelMessageToolCall>
  ): ActivityHistoryEntry {
    if ((roleType === HistoryEntryRoleType.TOOL_CALL || roleType === HistoryEntryRoleType.TOOL_RESULT) && !toolName && roleType !== HistoryEntryRoleType.ASSISTANT) {
      // Relaxed for ASSISTANT role as toolName is part of tool_calls.function.name
      // throw new Error("Tool name is required for tool_call and tool_result history entries.");
    }
    if (roleType === HistoryEntryRoleType.ASSISTANT && tool_calls && tool_calls.length > 0 && contentValue === null) {
      // This is valid: assistant message that only calls tools.
    } else if (contentValue === null && !(roleType === HistoryEntryRoleType.ASSISTANT && tool_calls && tool_calls.length > 0) ) {
      throw new Error("Content cannot be null unless it's an assistant message with tool_calls.");
    }


    const props: ActivityHistoryEntryProps = {
      role: HistoryEntryRole.create(roleType),
      content: EntryContent.create(contentValue === null ? "" : contentValue), // Store empty string if null, actual content otherwise
      timestamp: timestamp || JobTimestamp.now(),
      toolName: toolName,
      toolCallId: toolCallId,
      tool_calls: tool_calls ? Object.freeze([...tool_calls]) : undefined,
    };
    return new ActivityHistoryEntry(props);
  }

  public role(): HistoryEntryRoleType {
    return this.props.role.value();
  }

  public content(): string {
    return this.props.content.value();
  }

  public timestamp(): JobTimestamp {
    return this.props.timestamp;
  }

  public toolName(): string | undefined {
    return this.props.toolName;
  }

  public toolCallId(): string | undefined {
    return this.props.toolCallId;
  }

  // The 'equals' method from AbstractValueObject will compare based on JSON.stringify(this.props).
  // This should be sufficient as VOs within props also have reliable equals or primitive values.
}
