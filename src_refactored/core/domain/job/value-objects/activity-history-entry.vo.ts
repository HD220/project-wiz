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


interface ActivityHistoryEntryProps extends ValueObjectProps {
  role: HistoryEntryRole;
  content: EntryContent; // Could be string for messages, or structured object for tool calls/results
  timestamp: JobTimestamp;
  toolName?: string; // Optional: if role is TOOL_CALL or TOOL_RESULT
  toolCallId?: string; // Optional: if role is TOOL_CALL or TOOL_RESULT, to match calls with results
}

export class ActivityHistoryEntry extends AbstractValueObject<ActivityHistoryEntryProps> {
  private constructor(props: ActivityHistoryEntryProps) {
    super(props);
  }

  public static create(
    roleType: HistoryEntryRoleType,
    contentValue: string, // Keep as string for simplicity, assume JSON.stringify for objects
    timestamp?: JobTimestamp,
    toolName?: string,
    toolCallId?: string,
  ): ActivityHistoryEntry {
    if ((roleType === HistoryEntryRoleType.TOOL_CALL || roleType === HistoryEntryRoleType.TOOL_RESULT) && !toolName) {
        // throw new Error("Tool name is required for tool_call and tool_result history entries.");
        // Allow for now, but good practice to require it.
    }

    const props: ActivityHistoryEntryProps = {
      role: HistoryEntryRole.create(roleType),
      content: EntryContent.create(contentValue),
      timestamp: timestamp || JobTimestamp.now(),
      toolName: toolName,
      toolCallId: toolCallId,
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
