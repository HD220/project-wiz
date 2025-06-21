import { AbstractValueObject } from "@/core/common/value-objects/abstract.vo";
import { ActivityHistoryEntry } from "./activity-history-entry.vo";
import { ActivityHistory } from "./activity-history.vo";
import { ActivityNotes } from "./activity-notes.vo";
import { DomainError } from "@/core/common/errors";

// Import new VOs from context-parts
import { MessageContent } from "./context-parts/message-content.vo";
import { Sender } from "./context-parts/sender.vo";
import { ToolName } from "./context-parts/tool-name.vo";
import { GoalToPlan } from "./context-parts/goal-to-plan.vo";
import { PlannedStepsCollection } from "./context-parts/planned-steps.collection";
import { ValidationCriteriaCollection } from "./context-parts/validation-criteria.collection";
import { ValidationStatus, ValidationStatusType } from "./context-parts/validation-status.vo";

// Interface for the input to the static create method (uses primitives)
export interface ActivityContextPropsInput {
  messageContent?: string;
  sender?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  goalToPlan?: string;
  plannedSteps?: string[];
  activityNotes?: ActivityNotes; // Keep as VO for input, constructor handles default
  validationCriteria?: string[];
  validationResult?: ValidationStatusType; // Use the string enum type
  activityHistory: ActivityHistory; // Mandatory, already a VO
}

// Interface for internal props (uses VOs)
interface ActivityContextProps {
  messageContent?: MessageContent;
  sender?: Sender;
  toolName?: ToolName;
  toolArgs?: Record<string, unknown>; // Kept as Record for now
  goalToPlan?: GoalToPlan;
  plannedSteps?: PlannedStepsCollection;
  activityNotes: ActivityNotes; // Non-optional due to constructor initialization
  validationCriteria?: ValidationCriteriaCollection;
  validationResult?: ValidationStatus;
  activityHistory: ActivityHistory; // Mandatory, already a VO
}

// TODO: OBJECT_CALISTHENICS_REFACTOR: This VO is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods
// or by direct use of individual VOs if appropriate for the context.
export class ActivityContext {
  private readonly props: ActivityContextProps;

  private constructor(props: ActivityContextProps) {
    // VOs are validated upon their creation.
    // activityNotes and activityHistory are guaranteed by the create method.
    if (!props.activityHistory) { // Still good to double check mandatory props
      throw new DomainError("ActivityContext: activityHistory is mandatory.");
    }
    if (!props.activityNotes) {
      throw new DomainError("ActivityContext: activityNotes is mandatory.");
    }
    this.props = props;
  }

  // validateProps method removed

  public static create(props: Partial<ActivityContextPropsInput>): ActivityContext {
    if (!props.activityHistory) {
      throw new DomainError("ActivityContext.create requires activityHistory.");
    }

    const activityContextProps: ActivityContextProps = {
      messageContent: props.messageContent !== undefined ? MessageContent.create(props.messageContent) : undefined,
      sender: props.sender !== undefined ? Sender.create(props.sender) : undefined,
      toolName: props.toolName !== undefined ? ToolName.create(props.toolName) : undefined,
      toolArgs: props.toolArgs,
      goalToPlan: props.goalToPlan !== undefined ? GoalToPlan.create(props.goalToPlan) : undefined,
      plannedSteps: props.plannedSteps !== undefined ? PlannedStepsCollection.create(props.plannedSteps) : undefined,
      activityNotes: props.activityNotes || ActivityNotes.create([]), // Default if not provided
      validationCriteria: props.validationCriteria !== undefined ? ValidationCriteriaCollection.create(props.validationCriteria) : undefined,
      validationResult: props.validationResult !== undefined ? ValidationStatus.create(props.validationResult) : undefined,
      activityHistory: props.activityHistory, // Assumed to be already an ActivityHistory instance
    };
    return new ActivityContext(activityContextProps);
  }

  public addHistoryEntry(entry: ActivityHistoryEntry): ActivityContext {
    const updatedHistory = this.props.activityHistory.addEntry(entry);
    // Create a new props object for the new ActivityContext instance
    const newProps = { ...this.props, activityHistory: updatedHistory };
    return new ActivityContext(newProps); // Call constructor directly
  }

  public addNote(note: string): ActivityContext {
    const updatedNotes = this.props.activityNotes.addNote(note);
    const newProps = { ...this.props, activityNotes: updatedNotes };
    return new ActivityContext(newProps); // Call constructor directly
  }

  public getProps(): Readonly<ActivityContextProps> {
    return { ...this.props };
  }

  public equals(other?: ActivityContext): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof ActivityContext)) return false;

    // Mandatory fields
    if (!this.props.activityHistory.equals(other.props.activityHistory)) return false;
    if (!this.props.activityNotes.equals(other.props.activityNotes)) return false;

    // Optional fields comparison logic (example for one, extend for others)
    const compareOptionalVO = <T extends { equals(o: T): boolean }>(p1?: T, p2?: T): boolean => {
      if (p1 === undefined && p2 === undefined) return true;
      if (p1 && p2) return p1.equals(p2);
      return false; // One is defined, the other is not
    };

    if (!compareOptionalVO(this.props.messageContent, other.props.messageContent)) return false;
    if (!compareOptionalVO(this.props.sender, other.props.sender)) return false;
    if (!compareOptionalVO(this.props.toolName, other.props.toolName)) return false;
    if (!compareOptionalVO(this.props.goalToPlan, other.props.goalToPlan)) return false;
    if (!compareOptionalVO(this.props.plannedSteps, other.props.plannedSteps)) return false;
    if (!compareOptionalVO(this.props.validationCriteria, other.props.validationCriteria)) return false;
    if (!compareOptionalVO(this.props.validationResult, other.props.validationResult)) return false;

    // toolArgs is Record<string, unknown>, requires different comparison
    if (JSON.stringify(this.props.toolArgs) !== JSON.stringify(other.props.toolArgs)) return false;

    return true;
  }
}
