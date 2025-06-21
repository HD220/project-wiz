import { DomainError } from "@/core/common/errors";
import { EntryRole } from "./entry-role.vo";
import { EntryContent } from "./entry-content.vo";
import { JobTimestamp } from "./job-timestamp.vo";

interface ActivityHistoryEntryProps {
  role: EntryRole;
  content: EntryContent;
  timestamp: JobTimestamp;
}

// TODO: OBJECT_CALISTHENICS_REFACTOR: This VO is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods
// or by direct use of individual VOs if appropriate for the context.
export class ActivityHistoryEntry {
  private readonly props: ActivityHistoryEntryProps;

  private constructor(props: ActivityHistoryEntryProps) {
    // VOs are already validated by their own create methods.
    // Basic check to ensure props themselves are provided.
    if (!props.role || !props.content || !props.timestamp) {
      throw new DomainError("ActivityHistoryEntry: role, content, and timestamp are mandatory.");
    }
    this.props = props;
  }

  // validateProps method removed

  public static create(
    role: string,
    content: string,
    timestamp: Date | JobTimestamp // Allow either Date or JobTimestamp instance
  ): ActivityHistoryEntry {
    const roleVO = EntryRole.create(role);
    const contentVO = EntryContent.create(content);
    const timestampVO = timestamp instanceof JobTimestamp ? timestamp : JobTimestamp.create(timestamp);

    return new ActivityHistoryEntry({
      role: roleVO,
      content: contentVO,
      timestamp: timestampVO
    });
  }

  public getProps(): Readonly<ActivityHistoryEntryProps> {
    // Returning a shallow copy of the internal props object.
    // Since props contains VOs which are immutable or manage their state, this is acceptable.
    return { ...this.props };
  }

  // Individual getters getRole(), getContent(), getTimestamp() removed.
  // Consumers should use getProps().role, getProps().content, getProps().timestamp
  // which return the VOs themselves.

  public equals(other?: ActivityHistoryEntry): boolean {
    if (other === null || other === undefined) {
        return false;
    }
    if (!(other instanceof ActivityHistoryEntry)) {
        return false;
    }
    return (
        this.props.role.equals(other.props.role) &&
        this.props.content.equals(other.props.content) &&
        this.props.timestamp.equals(other.props.timestamp)
    );
  }
}
